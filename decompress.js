'use strict';

var fs = require('fs');
var _ = require('lodash');
var mkdir = require('mkdirp');
var tar = require('tar');
var unzip = require('unzip');
var zlib = require('zlib');

_.str = require('underscore.string');
_.mixin(_.str.exports());

function Decompress() {
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
}

Decompress.prototype.extract = function (opts) {
    opts = opts || {};
    opts.path = opts.path || process.cwd();
    var extractor = this._getExtractor(opts.type);

    if (!fs.existsSync(opts.path)) {
        mkdir.sync(opts.path);
    }

    return extractor(opts);
};

Decompress.prototype.canExtract = function (src, mime) {
    if (this._getExtractor(src)) {
        return true;
    }

    if (mime && this._getExtractor(mime)) {
        return true;
    }

    return false;
};

Decompress.prototype._getExtractor = function (src) {
    src = src.toLowerCase();

    var type = _.find(this.extractorTypes, function (type) {
        return _.endsWith(src, type);
    });

    return type ? this.extractors[type] : null;
};


Decompress.prototype._extractZip = function (opts) {
    return unzip.Extract(opts);
};

Decompress.prototype._extractTar = function (opts) {
    return tar.Extract(opts);
};

Decompress.prototype._extractTarGz = function (opts) {
    var stream = zlib.Gunzip();
    stream.pipe(tar.Extract(opts));

    return stream;
};

module.exports.extract = function (opts) {
    var unpacker = new Decompress();
    return unpacker.extract(opts);
};

module.exports.canExtract = function (src, mime) {
    var unpacker = new Decompress();
    return unpacker.canExtract(src, mime);
};
