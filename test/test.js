import path from 'path';
import test from 'ava';
import Decompress from '../';

test('extract .tar', t => {
	const decompress = new Decompress()
		.src(path.join(__dirname, 'fixtures/test.tar'))
		.use(Decompress.tar());

	decompress.run((err, files) => {
		t.is(err, null);
		t.is(files[0].path, 'test.jpg');
		t.end();
	});
});

test('extract .tar.bz2', t => {
	const decompress = new Decompress()
		.src(path.join(__dirname, 'fixtures/test.tar.bz2'))
		.use(Decompress.tarbz2());

	decompress.run((err, files) => {
		t.is(err, null);
		t.is(files[0].path, 'test.jpg', files[0].path);
		t.end();
	});
});

test('extract .tar.gz', t => {
	const decompress = new Decompress()
		.src(path.join(__dirname, 'fixtures/test.tar.gz'))
		.use(Decompress.targz());

	decompress.run((err, files) => {
		t.is(err, null);
		t.is(files[0].path, 'test.jpg');
		t.end();
	});
});

test('extract .zip', t => {
	const decompress = new Decompress()
		.src(path.join(__dirname, 'fixtures/test.zip'))
		.use(Decompress.zip());

	decompress.run((err, files) => {
		t.is(err, null);
		t.is(files[0].path, 'test.jpg');
		t.end();
	});
});

test('extract using the strip option', t => {
	const decompress = new Decompress()
		.src(path.join(__dirname, 'fixtures/test-strip.zip'))
		.use(Decompress.zip({strip: 1}));

	decompress.run((err, files) => {
		t.is(err, null);
		t.is(files[0].path, 'test-strip.jpg');
		t.end();
	});
});

test('do not extract nested archives', t => {
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
