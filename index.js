'use strict';

var combine = require('stream-combiner');
var concat = require('concat-stream');
var File = require('vinyl');
var fs = require('vinyl-fs');
var through = require('through2');

/**
 * Initialize Decompress
 *
 * @param {Object} opts
 * @api public
 */

function Decompress(opts) {
	if (!(this instanceof Decompress)) {
		return new Decompress(opts);
	}

	this.opts = opts || {};
	this.streams = [];
}

/**
 * Get or set the source files
 *
 * @param {Array|Buffer|String} file
 * @api public
 */

Decompress.prototype.src = function (file) {
	if (!arguments.length) {
		return this._src;
	}

	this._src = file;
	return this;
};

/**
 * Get or set the destination folder
 *
 * @param {String} dir
 * @api public
 */

Decompress.prototype.dest = function (dir) {
	if (!arguments.length) {
		return this._dest;
	}

	this._dest = dir;
	return this;
};

/**
 * Add a plugin to the middleware stack
 *
 * @param {Function} plugin
 * @api public
 */

Decompress.prototype.use = function (plugin) {
	this.streams.push(plugin);
	return this;
};

/**
 * Decompress archive
 *
 * @param {Function} cb
 * @api public
 */

Decompress.prototype.run = function (cb) {
	cb = cb || function () {};

	if (!this.streams.length) {
		this.use(Decompress.tar(this.opts));
		this.use(Decompress.tarbz2(this.opts));
		this.use(Decompress.targz(this.opts));
		this.use(Decompress.zip(this.opts));
	}

	this.streams.unshift(this.read(this.src()));

	if (this.dest()) {
		this.streams.push(fs.dest(this.dest(), this.opts));
	}

	var pipe = combine(this.streams);
	var end = concat(function (file) {
		cb(null, file, pipe);
	});

	pipe.on('error', cb);
	pipe.pipe(end);
};

/**
 * Read the source files
 *
 * @param {Array|Buffer|String} src
 * @api private
 */

Decompress.prototype.read = function (src) {
	if (Buffer.isBuffer(src)) {
		var stream = through.obj();

		stream.end(new File({
			contents: src
		}));

		return stream;
	}

	return fs.src(src);
};

/**
 * Module exports
 */

module.exports = Decompress;
module.exports.tar = require('decompress-tar');
module.exports.tarbz2 = require('decompress-tarbz2');
module.exports.targz = require('decompress-targz');
module.exports.zip = require('decompress-unzip');
