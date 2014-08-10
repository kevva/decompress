'use strict';

var each = require('each-async');
var fs = require('fs-extra');
var path = require('path');
var Ware = require('ware');

/**
 * Initialize Decompress
 *
 * @api public
 */

function Decompress() {
    this.ware = new Ware();
}

/**
 * Add a plugin to the middleware stack
 *
 * @param {Function} plugin
 * @api public
 */

Decompress.prototype.use = function (plugin) {
    this.ware.use(plugin);
    return this;
};

/**
 * Get or set the source file
 *
 * @param {String|Buffer} file
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
 * Get or set the destination path
 *
 * @param {String} path
 * @api public
 */

Decompress.prototype.dest = function (path) {
    if (!arguments.length) {
        return this._dest;
    }

    this._dest = path;
    return this;
};

/**
 * Decompress archive
 *
 * @param {Function} cb
 * @api public
 */

Decompress.prototype.decompress = function (cb) {
    cb = cb || function () {};
    var self = this;

    this.read(function (err, file) {
        if (!file || file.contents.length === 0) {
            return cb();
        }

        if (err) {
            return cb(err);
        }

        self.run(file, function (err) {
            if (err) {
                return cb(err);
            }

            self.write(self.files, function (err) {
                cb(err, file);
            });
        });
    });
};

/**
 * Run a file through the middleware
 *
 * @param {Object} file
 * @param {Function} cb
 * @api public
 */

Decompress.prototype.run = function (file, cb) {
    this.ware.run(file, this, cb);
};

/**
 * Read the archive
 *
 * @param {Function} cb
 * @api public
 */

Decompress.prototype.read = function (cb) {
    var file = {};
    var src = this.src();

    if (Buffer.isBuffer(src)) {
        file.contents = src;
        return cb(null, file);
    }

    fs.readFile(src, function (err, buf) {
        if (err) {
            return cb(err);
        }

        file.contents = buf;
        file.path = src;

        cb(null, file);
    });
};

/**
 * Write files to destination
 *
 * @param {Array} files
 * @param {Function} cb
 * @api public
 */

Decompress.prototype.write = function (files, cb) {
    var dest = this.dest();

    if (!dest) {
        return cb();
    }

    each(files, function (file, i, done) {
        fs.outputFile(path.join(dest, file.path), file.contents, function (err) {
            done(err);
        });
    }, function (err) {
        if (err) {
            return cb(err);
        }

        cb();
    });
};

/**
 * Module exports
 */

module.exports = Decompress;
module.exports.tar = require('decompress-tar');
module.exports.targz = require('decompress-targz');
module.exports.zip = require('decompress-unzip');
