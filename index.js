import {Buffer} from 'node:buffer';
import path from 'node:path';
import process from 'node:process';
import decompressTar from 'decompress-tar';
import decompressTarbz2 from 'decompress-tarbz2';
import decompressTargz from 'decompress-targz';
import decompressUnzip from 'decompress-unzip';
import fs from 'graceful-fs';
import makeDir from 'make-dir';
import pify from 'pify';
import stripDirs from 'strip-dirs';

const fsP = pify(fs);

const runPlugins = (input, options) => {
	if (options.plugins.length === 0) {
		return Promise.resolve([]);
	}

	return Promise.all(options.plugins.map(x => x(input, options)))
		// eslint-disable-next-line unicorn/no-array-reduce, unicorn/prefer-spread
		.then(files => files.reduce((a, b) => a.concat(b)));
};

const safeMakeDir = (dir, realOutputPath) => fsP.realpath(dir)
	.catch(_ => {
		const parent = path.dirname(dir);
		return safeMakeDir(parent, realOutputPath);
	})
	.then(realParentPath => {
		if (realParentPath.indexOf(realOutputPath) !== 0) {
			throw new Error('Refusing to create a directory outside the output path.');
		}

		return makeDir(dir).then(fsP.realpath);
	});

const preventWritingThroughSymlink = (destination, realOutputPath) => fsP.readlink(destination)
	// Either no file exists, or it's not a symlink. In either case, this is
	// not an escape we need to worry about in this phase.
	.catch(_ => null)
	.then(symlinkPointsTo => {
		if (symlinkPointsTo) {
			throw new Error('Refusing to write into a symlink');
		}

		// No symlink exists at `destination`, so we can continue
		return realOutputPath;
	});

const extractFile = (input, output, options) => runPlugins(input, options).then(files => {
	if (options.strip > 0) {
		files = files
			.map(x => {
				x.path = stripDirs(x.path, options.strip);
				return x;
			})
			.filter(x => x.path !== '.');
	}

	if (typeof options.filter === 'function') {
		// eslint-disable-next-line unicorn/no-array-callback-reference
		files = files.filter(options.filter);
	}

	if (typeof options.map === 'function') {
		// eslint-disable-next-line unicorn/no-array-callback-reference
		files = files.map(options.map);
	}

	if (!output) {
		return files;
	}

	return Promise.all(files.map(x => {
		const dest = path.join(output, x.path);
		const mode = x.mode & ~process.umask(); // eslint-disable-line no-bitwise
		const now = new Date();

		if (x.type === 'directory') {
			return makeDir(output)
				.then(outputPath => fsP.realpath(outputPath))
				.then(realOutputPath => safeMakeDir(dest, realOutputPath))
				.then(() => fsP.utimes(dest, now, x.mtime))
				.then(() => x);
		}

		return makeDir(output)
			.then(outputPath => fsP.realpath(outputPath))
			.then(realOutputPath =>
				// Attempt to ensure parent directory exists (failing if it's outside the output dir)
				safeMakeDir(path.dirname(dest), realOutputPath).then(() => realOutputPath),
			)
			.then(realOutputPath => {
				if (x.type === 'file') {
					return preventWritingThroughSymlink(dest, realOutputPath);
				}

				return realOutputPath;
			})
			.then(realOutputPath => fsP.realpath(path.dirname(dest))
				.then(realDestinationDir => {
					if (realDestinationDir.indexOf(realOutputPath) !== 0) {
						throw new Error(`Refusing to write outside output directory: ${realDestinationDir}`);
					}
				}))
			.then(() => {
				if (x.type === 'link') {
					return fsP.link(x.linkname, dest);
				}

				if (x.type === 'symlink' && process.platform === 'win32') {
					return fsP.link(x.linkname, dest);
				}

				if (x.type === 'symlink') {
					return fsP.symlink(x.linkname, dest);
				}

				return fsP.writeFile(dest, x.data, {mode});
			})
			.then(() => x.type === 'file' && fsP.utimes(dest, now, x.mtime))
			.then(() => x);
	}));
});

const decompress = (input, output, options) => {
	if (typeof input !== 'string' && !Buffer.isBuffer(input)) {
		return Promise.reject(new TypeError('Input file required'));
	}

	if (typeof output === 'object') {
		options = output;
		output = null;
	}

	options = {
		plugins: [
			decompressTar(),
			decompressTarbz2(),
			decompressTargz(),
			decompressUnzip(),
		],
		...options,
	};

	const read = typeof input === 'string' ? fsP.readFile(input) : Promise.resolve(input);

	return read.then(buf => extractFile(buf, output, options));
};

export default decompress;
