import path from 'path';
import fs from 'fs';
import os from 'os';
import test from 'ava';
import rimraf from 'rimraf';
import Decompress from '../';

test.after.cb(t => {
	rimraf(path.resolve(os.tmpdir(), 'decompress'), () => {
		t.end();
	});
});

test.cb('extract .tar', t => {
	const decompress = new Decompress()
		.src(path.join(__dirname, 'fixtures/test.tar'))
		.use(Decompress.tar());

	decompress.run((err, files) => {
		t.is(err, null);
		t.is(files[0].path, 'test.jpg');
		t.end();
	});
});

test.cb('extract .tar.bz2', t => {
	const decompress = new Decompress()
		.src(path.join(__dirname, 'fixtures/test.tar.bz2'))
		.use(Decompress.tarbz2());

	decompress.run((err, files) => {
		t.is(err, null);
		t.is(files[0].path, 'test.jpg', files[0].path);
		t.end();
	});
});

test.cb('extract .tar.gz', t => {
	const decompress = new Decompress()
		.src(path.join(__dirname, 'fixtures/test.tar.gz'))
		.use(Decompress.targz());

	decompress.run((err, files) => {
		t.is(err, null);
		t.is(files[0].path, 'test.jpg');
		t.end();
	});
});

test.cb('extract .zip', t => {
	const decompress = new Decompress()
		.src(path.join(__dirname, 'fixtures/test.zip'))
		.use(Decompress.zip());

	decompress.run((err, files) => {
		t.is(err, null);
		t.is(files[0].path, 'test.jpg');
		t.end();
	});
});

test.cb('extract .zip including multiple files', t => {
	const decompress = new Decompress()
		.src(path.join(__dirname, 'fixtures/test-multiple.zip'))
		.use(Decompress.zip({strip: 1}));

	decompress.run((err, files) => {
		t.is(err, null);
		t.is(files.length, 2);
		t.is(files[0].path, 'test0.jpg');
		t.is(files[1].path, 'test1.jpg');
		t.end();
	});
});

test.cb('extract using the strip option', t => {
	const decompress = new Decompress()
		.src(path.join(__dirname, 'fixtures/test-strip.zip'))
		.use(Decompress.zip({strip: 1}));

	decompress.run((err, files) => {
		t.is(err, null);
		t.is(files[0].path, 'test-strip.jpg');
		t.end();
	});
});

test.cb('do not extract nested archives', t => {
	const decompress = new Decompress()
		.src(path.join(__dirname, 'fixtures/test-nested.tar.gz'))
		.use(Decompress.targz())
		.use(Decompress.zip());

	decompress.run((err, files) => {
		t.is(err, null);
		t.is(files[0].path, 'test.zip');
		t.end();
	});
});

test.cb('set correct permissions with default perms', t => {
	const decompress = new Decompress({mode: '0755'})
		.src(path.join(__dirname, 'fixtures/test-no-perms.zip'))
		.dest(path.resolve(os.tmpdir(), 'decompress/no-perms'))
		.use(Decompress.targz())
		.use(Decompress.zip());

	decompress.run((err, files) => {
		t.is(err, null);
		let fileMode = fs.lstatSync(files[0].path).mode;
		t.is((fileMode & parseInt('777', 8)).toString(8), '755');
		t.end();
	});
});
