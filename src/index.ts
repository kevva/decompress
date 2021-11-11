import type { DecompressPlugin, File } from '@xingrz/decompress-types';
import { dirname, join } from 'path';
import { readFile, realpath, readlink, utimes, link, symlink, writeFile, mkdirs } from 'fs-extra';
import decompressTar from '@xingrz/decompress-tar';
import decompressTarzst from '@xingrz/decompress-tarzst';
import decompressTarbz2 from 'decompress-tarbz2';
import decompressTargz from 'decompress-targz';
import decompressUnzip from 'decompress-unzip';
import stripDirs from 'strip-dirs';

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
	plugins?: DecompressPlugin<any>[];

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
	let realParentPath: string;
	try {
		realParentPath = await realpath(dir);
	} catch (e) {
		const parent = dirname(dir);
		realParentPath = await safeMakeDir(parent, realOutputPath);
	}

	if (!realParentPath.startsWith(realOutputPath)) {
		throw new Error('Refusing to create a directory outside the output path.');
	}

	await mkdirs(dir);
	return await realpath(dir);
}

async function preventWritingThroughSymlink(destination: string): Promise<void> {
	let symlinkPointsTo: string;
	try {
		symlinkPointsTo = await readlink(destination);
	} catch (_) {
		// Either no file exists, or it's not a symlink. In either case, this is
		// not an escape we need to worry about in this phase.
		return;
	}

	if (symlinkPointsTo) {
		throw new Error('Refusing to write into a symlink');
	}

	// No symlink exists at `destination`, so we can continue
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

	// Creation of hard links should be deferred until all files are wrote
	const links: File[] = [];

	await Promise.all(files.map(async x => {
		const dest = join(output, x.path);
		const now = new Date();

		await mkdirs(output);
		const realOutputPath = await realpath(output);

		if (x.type === 'directory') {
			await safeMakeDir(dest, realOutputPath);
			await utimes(dest, now, new Date(x.mtime));
			return;
		}

		// Attempt to ensure parent directory exists (failing if it's outside the output dir)
		await safeMakeDir(dirname(dest), realOutputPath);

		if (x.type === 'file') {
			await preventWritingThroughSymlink(dest);
		}

		const realDestinationDir = await realpath(dirname(dest));
		if (!realDestinationDir.startsWith(realOutputPath)) {
			throw new Error('Refusing to write outside output directory: ' + realDestinationDir);
		}

		if (x.type === 'link') {
			links.push(x);
		} else if (x.type === 'symlink') {
			if (process.platform === 'win32') {
				links.push(x);
			} else {
				await symlink(x.linkname!, dest);
			}
		} else {
			await writeFile(dest, x.data, { mode: x.mode })
		}

		if (x.type === 'file') {
			await utimes(dest, now, new Date(x.mtime));
		}
	}));

	await Promise.all(links.map(async x => {
		const dest = join(output, x.path);
		await link(join(output, x.linkname!), dest);
	}));

	return files;
}

export default async function decompress(input: string | Buffer, output?: string | null | DecompressOptions, opts?: DecompressOptions): Promise<File[]> {
	if (typeof input !== 'string' && !Buffer.isBuffer(input)) {
		throw new TypeError('Input file required');
	}

	if (typeof output == 'object') {
		opts = output!;
		output = null;
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

	return extractFile(buf, output || null, opts);
}
