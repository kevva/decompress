import fs from 'fs';
import path from 'path';
import isJpg from 'is-jpg';
import pathExists from 'path-exists';
import pify from 'pify';
import test from 'ava';
import m from './';

const fsP = pify(fs);

test('extract file', async t => {
	const files = await m(path.join(__dirname, 'fixtures', 'file.tar'));

	t.is(files[0].path, 'test.jpg');
	t.true(isJpg(files[0].data));
});

test('extract file using buffer', async t => {
	const buf = await fsP.readFile(path.join(__dirname, 'fixtures', 'file.tar'));
	const files = await m(buf);

	t.is(files[0].path, 'test.jpg');
	t.true(isJpg(files[0].data));
});

test('extract file to directory', async t => {
	const files = await m(path.join(__dirname, 'fixtures', 'file.tar'), __dirname);

	t.is(files[0].path, 'test.jpg');
	t.true(isJpg(files[0].data));
	t.true(await pathExists(path.join(__dirname, 'test.jpg')));

	await fsP.unlink(path.join(__dirname, 'test.jpg'));
});

test('strip option', async t => {
	const zipFiles = await m(path.join(__dirname, 'fixtures', 'strip.zip'), {strip: 1});
	const tarFiles = await m(path.join(__dirname, 'fixtures', 'strip.tar'), {strip: 1});

	t.is(zipFiles[0].path, 'test-strip.jpg');
	t.true(isJpg(zipFiles[0].data));
	t.is(tarFiles[0].path, 'test-strip.jpg');
	t.true(isJpg(tarFiles[0].data));
});

test('return emptpy array if no plugins are set', async t => {
	const files = await m(path.join(__dirname, 'fixtures', 'file.tar'), {plugins: []});
	t.is(files.length, 0);
});
