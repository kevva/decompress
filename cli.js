#!/usr/bin/env node
'use strict';

var Decompress = require('./');
var fs = require('fs');
var nopt = require('nopt');
var pkg = require('./package.json');
var stdin = require('get-stdin');

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
	console.log([
		'',
		'  ' + pkg.description,
		'',
		'  Usage',
		'    decompress <file> [directory]',
		'    cat <file> | decompress [directory]',
		'',
		'  Example',
		'    decompress --strip 1 file.zip out',
		'    cat file.zip | decompress out',
		'',
		'  Options',
		'    -m, --mode     Set mode on the extracted files',
		'    -s, --strip    Equivalent to --strip-components for tar'
	].join('\n'));
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
		.use(Decompress.tarbz2(opts))
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

if (process.stdin.isTTY) {
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
} else {
	var dest = opts.argv.remain;

	if (dest.length && !isFile(dest[dest.length - 1])) {
		dest = dest[dest.length - 1];
	} else {
		dest = process.cwd();
	}

	stdin.buffer(function (buf) {
		run(buf, dest);
	});
}
