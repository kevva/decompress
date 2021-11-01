import { dirname, join } from 'path';
import { readFile, realpath, readlink, utimes, link, symlink, writeFile } from 'fs/promises';
import decompressTar from 'decompress-tar';
import decompressTarbz2 from 'decompress-tarbz2';
import decompressTargz from 'decompress-targz';
import decompressTarzst from '@xingrz/decompress-tarzst';
import decompressUnzip from 'decompress-unzip';
import makeDir from 'make-dir';
import stripDirs from 'strip-dirs';

export interface File {
	data: Buffer;
	mode: number;
	mtime: string;
	path: string;
	type: string;
	linkname?: string;
}

export type DecompressPlugin = (input: Buffer, opts?: DecompressOptions) => Promise<File[]>;

export interface DecompressOptions {
	/**
	 * Filter out files before extracting
	 */
	filter?(file: File): boolean;

	/**
	 * Map files before extracting
	 */
	map?(file: File): File;
	/**
	 * Array of plugins to use.
	 * Default: [decompressTar(), decompressTarbz2(), decompressTargz(), decompressUnzip()]
	 */
	plugins?: DecompressPlugin[];

	/**
	 * Remove leading directory components from extracted files.
	 * Default: 0
	 */
	strip?: number;
}

async function runPlugins(input: Buffer, opts: DecompressOptions): Promise<File[]> {
	const plugins = opts.plugins || [];
	if (plugins.length === 0) {
		return [];
	}

	const files = await Promise.all(plugins.map(x => x(input, opts)));
	return files.reduce((a, b) => a.concat(b));
}

async function safeMakeDir(dir: string, realOutputPath: string): Promise<string> {
	try {
		const realParentPath = await realpath(dir);
		if (!realOutputPath.startsWith(realParentPath)) {
			throw new Error('Refusing to create a directory outside the output path.');
		}
		const dirPath = await makeDir(dir);
		return await realpath(dirPath);
	} catch (e) {
		const parent = dirname(dir);
		return safeMakeDir(parent, realOutputPath);
	}
}

async function preventWritingThroughSymlink(destination: string, realOutputPath: string): Promise<string | null> {
	try {
		if (await readlink(destination)) {
			throw new Error('Refusing to write into a symlink');
		}

		// No symlink exists at `destination`, so we can continue
		return realOutputPath;
	} catch (_) {
		// Either no file exists, or it's not a symlink. In either case, this is
		// not an escape we need to worry about in this phase.
		return null;
	}
}

async function extractFile(input: Buffer, output: string | null, opts: DecompressOptions): Promise<File[]> {
	let files = await runPlugins(input, opts);

	const { strip } = opts;
	if (typeof strip === 'number' && strip > 0) {
		files = files
			.map(x => {
				x.path = stripDirs(x.path, strip);
				return x;
			})
			.filter(x => x.path !== '.');
	}

	if (typeof opts.filter === 'function') {
		files = files.filter(opts.filter);
	}

	if (typeof opts.map === 'function') {
		files = files.map(opts.map);
	}

	if (!output) {
		return files;
	}

	return Promise.all(files.map(async x => {
		const dest = join(output, x.path);
		const now = new Date();

		const outputPath = await makeDir(output);
		let realOutputPath: string | null = await realpath(outputPath);

		if (x.type === 'directory') {
			await safeMakeDir(dest, realOutputPath);
			await utimes(dest, now, x.mtime);
			return x;
		}

		// Attempt to ensure parent directory exists (failing if it's outside the output dir)
		await safeMakeDir(dirname(dest), realOutputPath);

		if (x.type === 'file') {
			realOutputPath = await preventWritingThroughSymlink(dest, realOutputPath);
		}

		const realDestinationDir = await realpath(dirname(dest));
		if (!realOutputPath || !realOutputPath.startsWith(realDestinationDir)) {
			throw new Error('Refusing to write outside output directory: ' + realDestinationDir);
		}

		if (x.type === 'link') {
			await link(x.linkname!, dest);
		} else if (x.type === 'symlink') {
			if (process.platform === 'win32') {
				await link(x.linkname!, dest);
			} else {
				await symlink(x.linkname!, dest);
			}
		} else {
			await writeFile(dest, x.data, { mode: x.mode })
		}

		if (x.type === 'file') {
			await utimes(dest, now, x.mtime);
		}

		return x;
	}));
}

export default async function decompress(input: string | Buffer, output: string | null = null, opts?: DecompressOptions): Promise<File[]> {
	if (typeof input !== 'string' && !Buffer.isBuffer(input)) {
		throw new TypeError('Input file required');
	}

	opts = {
		plugins: [
			decompressTar(),
			decompressTarbz2(),
			decompressTargz(),
			decompressTarzst(),
			decompressUnzip()
		],
		...opts,
	};

	const buf = typeof input === 'string' ? await readFile(input) : input;

	return extractFile(buf, output, opts);
}
