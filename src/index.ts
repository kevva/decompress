import type { DecompressPlugin, DecompressPluginOptions, File } from '@xingrz/decompress-types';
import { dirname, join } from 'path';
import { Readable } from 'stream';
import { createWriteStream } from 'fs';
import { readFile, realpath, readlink, utimes, link, symlink, writeFile, mkdirs } from 'fs-extra';
import decompressTar from '@xingrz/decompress-tar';
import decompressTarbz2 from '@xingrz/decompress-tarbz2';
import decompressTargz from '@xingrz/decompress-targz';
import decompressTarzst from '@xingrz/decompress-tarzst';
import decompressUnzip from '@xingrz/decompress-unzip';
import { pipeline as _pipeline } from 'stream';
import { promisify } from 'util';
import stripDirs from 'strip-dirs';

const pipeline = promisify(_pipeline);

export interface DecompressOptions extends DecompressPluginOptions {
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

function applyFileMappers(file: File, opts: DecompressOptions): boolean {
	const { strip, filter, map } = opts;

	if (typeof strip === 'number' && strip > 0) {
		file = Object.assign(file, { path: stripDirs(file.path, strip) });
		if (file.path === '.') {
			return false;
		}
	}

	if (typeof filter === 'function') {
		if (!filter(file)) {
			return false;
		}
	}

	if (typeof map === 'function') {
		file = map(file);
	}

	return true;
}

async function extractFile(input: Buffer, output: string | null, opts: DecompressOptions): Promise<File[]> {
	if (output) {
		opts.fileWriter = (file, input) => outputFile({ ...file }, input, output, opts);
	}

	const files = await runPlugins(input, opts)
	return files.filter(file => applyFileMappers(file, opts));
}

async function outputFile(file: File, input: Readable | undefined, output: string, opts: DecompressOptions): Promise<void> {
	if (!applyFileMappers(file, opts)) {
		input?.resume();
		return;
	}

	const dest = join(output, file.path);
	const now = new Date();

	await mkdirs(output);
	const realOutputPath = await realpath(output);

	if (file.type === 'directory') {
		await safeMakeDir(dest, realOutputPath);
		await utimes(dest, now, new Date(file.mtime));
		return;
	}

	// Attempt to ensure parent directory exists (failing if it's outside the output dir)
	await safeMakeDir(dirname(dest), realOutputPath);

	if (file.type === 'file') {
		await preventWritingThroughSymlink(dest);
	}

	const realDestinationDir = await realpath(dirname(dest));
	if (!realDestinationDir.startsWith(realOutputPath)) {
		throw new Error('Refusing to write outside output directory: ' + realDestinationDir);
	}

	if (file.type === 'link') {
		await link(join(output, file.linkname!), dest);
	} else if (file.type === 'symlink') {
		if (process.platform === 'win32') {
			await link(join(output, file.linkname!), dest);
		} else {
			await symlink(file.linkname!, dest);
		}
	} else if (file.type === 'file' && input) {
		await pipeline(input, createWriteStream(dest, { mode: file.mode }));
		await utimes(dest, now, new Date(file.mtime));
	}
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
