'use strict';

var Decompress = require('../');
var fs = require('fs');
var path = require('path');
var rm = require('rimraf');
var spawn = require('child_process').spawn;
var test = require('ava');

test('extract .tar', function (t) {
	t.plan(2);

	var decompress = new Decompress()
		.src(path.join(__dirname, 'fixtures/test.tar'))
		.use(Decompress.tar());

	decompress.run(function (err, files) {
		t.assert(!err);
		t.assert(files[0].path === 'test.jpg');
	});
});

test('extract .tar.bz2', function (t) {
	t.plan(2);

	var decompress = new Decompress()
		.src(path.join(__dirname, 'fixtures/test.tar.bz2'))
		.use(Decompress.tarbz2());

	decompress.run(function (err, files) {
		t.assert(!err);
		t.assert(files[0].path === 'test.jpg');
	});
});

test('extract .tar.gz', function (t) {
	t.plan(2);

	var decompress = new Decompress()
		.src(path.join(__dirname, 'fixtures/test.tar.gz'))
		.use(Decompress.targz());

	decompress.run(function (err, files) {
		t.assert(!err);
		t.assert(files[0].path === 'test.jpg');
	});
});

test('extract .zip', function (t) {
	t.plan(2);

	var decompress = new Decompress()
		.src(path.join(__dirname, 'fixtures/test.zip'))
		.use(Decompress.zip());

	decompress.run(function (err, files) {
		t.assert(!err);
		t.assert(files[0].path === 'test.jpg');
	});
});

test('extract using the strip option', function (t) {
	t.plan(2);

	var decompress = new Decompress()
		.src(path.join(__dirname, 'fixtures/test-strip.zip'))
		.use(Decompress.zip({ strip: 1 }));

	decompress.run(function (err, files) {
		t.assert(!err);
		t.assert(files[0].path === 'test-strip.jpg');
	});
});

test('extract from stdin using the CLI', function (t) {
	t.plan(3);

	var tmp = path.join(__dirname, 'tmp');
	var cli = spawn(path.join(__dirname, '../cli.js'), [tmp]);
	var src = fs.createReadStream(path.join(__dirname, 'fixtures/test.zip'));

	cli.on('close', function (code) {
		t.assert(!code);

		fs.exists(path.join(tmp, 'test.jpg'), function (exists) {
			t.assert(exists);

			rm(tmp, function (err) {
				t.assert(!err);
			});
		});
	});

	src.pipe(cli.stdin);
});
