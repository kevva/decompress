import { readFile, stat, remove, pathExists, realpath, mkdtemp, ensureDir } from 'fs-extra';
import { join } from 'path';
import fileType from 'file-type';
import m from '../src';

const FIXTURES_DIR = join(__dirname, 'fixtures');
const OUTPUT_DIR = join(__dirname, 'output');

async function isJpg(buf: Buffer): Promise<boolean> {
	return (await fileType.fromBuffer(buf))?.ext == 'jpg';
}

beforeAll(async () => {
	await remove(OUTPUT_DIR);
	await remove('/tmp/dist');
});

afterAll(async () => {
	await remove(OUTPUT_DIR);
	await remove('/tmp/dist');
});

async function createTempDir() {
	await ensureDir(OUTPUT_DIR);
	return await mkdtemp(join(OUTPUT_DIR, 'test-'));
}

test('extract file', async () => {
	const tarFiles = await m(join(FIXTURES_DIR, 'file.tar'));
	const tarbzFiles = await m(join(FIXTURES_DIR, 'file.tar.bz2'));
	const targzFiles = await m(join(FIXTURES_DIR, 'file.tar.gz'));
	const tarzstFiles = await m(join(FIXTURES_DIR, 'file.tar.zst'));
	const zipFiles = await m(join(FIXTURES_DIR, 'file.zip'));

	expect(tarFiles[0].path).toBe('test.jpg');
	expect(await isJpg(tarFiles[0].data)).toBe(true);
	expect(tarbzFiles[0].path).toBe('test.jpg');
	expect(await isJpg(tarbzFiles[0].data)).toBe(true);
	expect(targzFiles[0].path).toBe('test.jpg');
	expect(await isJpg(targzFiles[0].data)).toBe(true);
	expect(tarzstFiles[0].path).toBe('test.jpg');
	expect(await isJpg(tarzstFiles[0].data)).toBe(true);
	expect(zipFiles[0].path).toBe('test.jpg');
	expect(await isJpg(zipFiles[0].data)).toBe(true);
});

test('extract file using buffer', async () => {
	const tarBuf = await readFile(join(FIXTURES_DIR, 'file.tar'));
	const tarFiles = await m(tarBuf);
	const tarbzBuf = await readFile(join(FIXTURES_DIR, 'file.tar.bz2'));
	const tarbzFiles = await m(tarbzBuf);
	const targzBuf = await readFile(join(FIXTURES_DIR, 'file.tar.gz'));
	const targzFiles = await m(targzBuf);
	const tarzstBuf = await readFile(join(FIXTURES_DIR, 'file.tar.zst'));
	const tarzstFiles = await m(tarzstBuf);
	const zipBuf = await readFile(join(FIXTURES_DIR, 'file.zip'));
	const zipFiles = await m(zipBuf);

	expect(tarFiles[0].path).toBe('test.jpg');
	expect(tarbzFiles[0].path).toBe('test.jpg');
	expect(targzFiles[0].path).toBe('test.jpg');
	expect(tarzstFiles[0].path).toBe('test.jpg');
	expect(zipFiles[0].path).toBe('test.jpg');
});

test('extract file to directory', async () => {
	const dist = await createTempDir();

	const files = await m(join(FIXTURES_DIR, 'file.tar'), dist);

	expect(files[0].path).toBe('test.jpg');
	expect(await isJpg(files[0].data)).toBe(true);
	expect(await pathExists(join(dist, 'test.jpg'))).toBe(true);
});

test('extract symlink', async () => {
	const dist = await createTempDir();
	await m(join(FIXTURES_DIR, 'symlink.tar'), dist, { strip: 1 });
	expect(await realpath(join(dist, 'symlink'))).toBe(join(dist, 'file.txt'));
});

test('extract hardlink', async () => {
	const dist = await createTempDir();
	await m(join(FIXTURES_DIR, 'hardlink.tar'), dist);

	const sourceBuf = await readFile(join(dist, 'source'));
	const sourceStat = await stat(join(dist, 'source'));
	const linkBuf = await readFile(join(dist, 'hard_link'));
	const linkStat = await stat(join(dist, 'hard_link'));

	expect(sourceBuf).toEqual(linkBuf);
	expect(sourceStat.ino).toBe(linkStat.ino);
});

test('extract directory', async () => {
	const dist = await createTempDir();
	await m(join(FIXTURES_DIR, 'directory.tar'), dist);
	expect(await pathExists(join(dist, 'directory'))).toBe(true);
});

test('strip option', async () => {
	const zipFiles = await m(join(FIXTURES_DIR, 'strip.zip'), { strip: 1 });
	const tarFiles = await m(join(FIXTURES_DIR, 'strip.tar'), { strip: 1 });

	expect(zipFiles[0].path).toBe('test-strip.jpg');
	expect(await isJpg(zipFiles[0].data)).toBe(true);
	expect(tarFiles[0].path).toBe('test-strip.jpg');
	expect(await isJpg(tarFiles[0].data)).toBe(true);
});

test('filter option', async () => {
	const files = await m(join(FIXTURES_DIR, 'file.tar'), {
		filter: x => x.path !== 'test.jpg'
	});

	expect(files.length).toBe(0);
});

test('map option', async () => {
	const files = await m(join(FIXTURES_DIR, 'file.tar'), {
		map: (x) => {
			x.path = `unicorn-${x.path}`;
			return x;
		}
	});

	expect(files[0].path).toBe('unicorn-test.jpg');
});

test('set mtime', async () => {
	const dist = await createTempDir();
	const files = await m(join(FIXTURES_DIR, 'file.tar'), dist);
	const { mtime } = await stat(join(dist, 'test.jpg'));
	expect(files[0].mtime).toEqual(mtime);
});

test('return emptpy array if no plugins are set', async () => {
	const files = await m(join(FIXTURES_DIR, 'file.tar'), { plugins: [] });
	expect(files.length).toBe(0);
});

test('throw when a location outside the root is given', async () => {
	const dist = await createTempDir();
	await expect(async () => {
		await m(join(FIXTURES_DIR, 'slipping.tar.gz'), dist);
	}).rejects.toThrow(/Refusing/);
});

test('throw when a location outside the root including symlinks is given', async () => {
	const dist = await createTempDir();
	await expect(async () => {
		await m(join(FIXTURES_DIR, 'slip.zip'), dist);
	}).rejects.toThrow(/Refusing/);
});

test('throw when a top-level symlink outside the root is given', async () => {
	const dist = await createTempDir();
	await expect(async () => {
		await m(join(FIXTURES_DIR, 'slip2.zip'), dist);
	}).rejects.toThrow(/Refusing/);
});

test('throw when a directory outside the root including symlinks is given', async () => {
	const dist = await createTempDir();
	await expect(async () => {
		await m(join(FIXTURES_DIR, 'slipping_directory.tar.gz'), dist);
	}).rejects.toThrow(/Refusing/);
});

test('allows filenames and directories to be written with dots in their names', async () => {
	const dist = await createTempDir();
	const files = await m(join(FIXTURES_DIR, 'edge_case_dots.tar.gz'), dist);
	expect(files.length).toBe(6);
	expect(files.map(f => f.path).sort()).toEqual([
		'edge_case_dots/',
		'edge_case_dots/internal_dots..txt',
		'edge_case_dots/sample../',
		'edge_case_dots/ending_dots..',
		'edge_case_dots/x',
		'edge_case_dots/sample../test.txt'
	].sort());
});

test('allows top-level file', async () => {
	const dist = await createTempDir();
	const files = await m(join(FIXTURES_DIR, 'top_level_example.tar.gz'), dist);
	expect(files.length).toBe(1);
	expect(files[0].path).toBe('example.txt');
});

test('throw when chained symlinks to /tmp/dist allow escape outside root directory', async () => {
	await expect(async () => {
		await m(join(FIXTURES_DIR, 'slip3.zip'), '/tmp/dist');
	}).rejects.toThrow(/Refusing/);
});
