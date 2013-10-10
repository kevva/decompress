'use strict';

var AdmZip = require('adm-zip');
var fs = require('fs');
var mkdir = require('mkdirp');
var mout = require('mout');
var path = require('path');
var pipeline = require('stream-combiner');
var rm = require('rimraf');
var tar = require('tar');
var temp = require('temp');
var zlib = require('zlib');

/**
 * Initialize Decompress with options
 *
 * Options:
 *
 *   - `ext` String with file name, MIME type, etc
 *   - `path` Path to extract to
 *
 * @param {Object} opts
 * @api private
 */

function Decompress(opts) {
    opts = opts || {};
    opts.strip = opts.strip || 0;
    this.opts = opts;
    this.path = opts.path || process.cwd();
    this.ext = opts.ext || '';
    this.strip = opts.strip >= 0 ? opts.strip : 0;
    this.extractors = {
        '.zip': this._extractZip,
        '.tar': this._extractTar,
        '.tar.gz': this._extractTarGz,
        '.tgz': this._extractTarGz,
        'application/zip': this._extractZip,
        'application/x-tar': this._extractTar,
        'application/x-tgz': this._extractTarGz
    };
    this.extractorTypes = Object.keys(this.extractors);
    this.extractor = this._getExtractor(this.ext);
}

/**
 * Extract an archive
 *
 * @api public
 */

Decompress.prototype.extract = function () {
    var self = this;
    var stream = this.extractor();

    if (!fs.existsSync(this.path)) {
        mkdir.sync(self.path);
    }

    return stream;
};

/**
 * Check if a file can be extracted
 *
 * @param {String} src
 * @param {String} mime
 * @api public
 */

Decompress.prototype.canExtract = function (src, mime) {
    if (this._getExtractor(src)) {
        return true;
    }

    if (mime && this._getExtractor(mime)) {
        return true;
    }

    return false;
};

/**
 * Get the extractor for a desired file
 *
 * @param {String} src
 * @api private
 */

Decompress.prototype._getExtractor = function (src) {
    src = src.toLowerCase();

    var ext = mout.array.find(this.extractorTypes, function (ext) {
        return mout.string.endsWith(src, ext);
    });

    return ext ? this.extractors[ext] : null;
};

/**
 * Extract a zip file
 *
 * @api private
 */

Decompress.prototype._extractZip = function () {
    var self = this;
    var tmp = temp.path({ suffix: '.zip' });

    var stream = fs.createWriteStream(tmp).on('close', function () {
        var zip = new AdmZip(tmp);
        var zipEntries = zip.getEntries();

        zipEntries.forEach(function (entry) {
            var e = entry.entryName.toString().split('/').slice(self.strip).join('/');
            var d = path.join(self.path, e);
            var c = entry.getData().toString();

            if (!entry.isDirectory) {
                mkdir.sync(path.dirname(d));
                fs.writeFileSync(d, c);
            }
        });
    });

    return stream.on('close', function () {
        rm.sync(tmp);
    });
};

/**
 * Extract a tar file
 *
 * @api private
 */

Decompress.prototype._extractTar = function () {
    var stream = tar.Extract(this.opts);
    return stream;
};

/**
 * Extract a tar.gz file
 *
 * @api private
 */

Decompress.prototype._extractTarGz = function () {
    var stream = zlib.Unzip();
    var dest = tar.Extract(this.opts);

    return pipeline(stream, dest);
};

/**
 * Module exports
 */

module.exports.extract = function (opts) {
    var decompress = new Decompress(opts);
    return decompress.extract();
};

module.exports.canExtract = function (src, mime) {
    var decompress = new Decompress();
    return decompress.canExtract(src, mime);
};
