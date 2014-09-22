#!/usr/bin/env node
'use strict';

var Decompress = require('./');
var fs = require('fs');
var nopt = require('nopt');
var pkg = require('./package.json');

/**
 * Options
 */

var opts = nopt({
	help: Boolean,
	mode: Number,
	strip: String,
	version: Boolean
}, {
	h: '--help',
	m: '--mode',
	s: '--strip',
	v: '--version'
});

/**
 * Help screen
 */

function help() {
	console.log(pkg.description);
	console.log('');
	console.log('Usage');
	console.log('  $ decompress <file> [directory]');
	console.log('');
	console.log('Example');
	console.log('  $ decompress --strip 1 file.zip out');
	console.log('');
	console.log('Options');
	console.log('  -m, --mode     Set mode on the extracted files');
	console.log('  -s, --strip    Equivalent to --strip-components for tar');
}

/**
 * Show help
 */

if (opts.help) {
	help();
	return;
}

/**
 * Show package version
 */

if (opts.version) {
	console.log(pkg.version);
	return;
}

/**
 * Check if path is a file
 *
 * @param {String} path
 * @api private
 */

function isFile(path) {
	if (/^[^\s]+\.\w*$/g.test(path)) {
		return true;
	}

	try {
		return fs.statSync(path).isFile();
	} catch (e) {
		return false;
	}
}

/**
 * Run
 *
 * @param {String} src
 * @param {String} dest
 * @api private
 */

function run(src, dest) {
	var decompress = new Decompress(opts)
		.src(src)
		.dest(dest)
		.use(Decompress.tar(opts))
		.use(Decompress.targz(opts))
		.use(Decompress.zip(opts));

	decompress.run(function (err) {
		if (err) {
			console.error(err);
			process.exit(1);
		}
	});
}

/**
 * Apply arguments
 */

var src = opts.argv.remain;
var dest = process.cwd();

if (!src.length) {
	help();
	return;
}

if (!isFile(src[src.length - 1])) {
	dest = src[src.length - 1];
	src.pop();
}

run(src, dest);
