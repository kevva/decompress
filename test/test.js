/*global afterEach, describe, it */
'use strict';

var assert = require('assert');
var decompress = require('../');
var fs = require('fs');
var path = require('path');
var rm = require('rimraf');

describe('decompress.canExtract()', function () {
    it('can extract .zip', function (cb) {
        cb(assert.equal(decompress.canExtract('.zip'), true));
    });

    it('can extract application/zip', function (cb) {
        cb(assert.equal(decompress.canExtract('application/zip'), true));
    });

    it('cannot extract .rar', function (cb) {
        cb(assert.equal(decompress.canExtract('.rar'), false));
    });

    it('cannot extract application/x-rar-compressed', function (cb) {
        cb(assert.equal(decompress.canExtract('application/x-rar-compressed'), false));
    });
});

describe('decompress.extract()', function () {
    afterEach(function (cb) {
        rm(path.join(__dirname, 'tmp'), cb);
    });

    it('should extract .zip', function (cb) {
        var tmp = path.join(__dirname, 'tmp');
        var src = fs.createReadStream(path.join(__dirname, 'fixtures/test.zip'));
        var dest = decompress({ ext: '.zip', path: tmp });

        src.pipe(dest);

        dest.on('close', function () {
            cb(assert.ok(fs.existsSync(path.join(tmp, 'test.jpg'))));
        });
    });

    it('should extract .tar', function (cb) {
        var tmp = path.join(__dirname, 'tmp');
        var src = fs.createReadStream(path.join(__dirname, 'fixtures/test.tar'));
        var dest = decompress({ ext: '.tar', path: tmp });

        src.pipe(dest);

        dest.on('close', function () {
            cb(assert.ok(fs.existsSync(path.join(tmp, 'test.jpg'))));
        });
    });

    it('should extract .tar.gz', function (cb) {
        var tmp = path.join(__dirname, 'tmp');
        var src = fs.createReadStream(path.join(__dirname, 'fixtures/test.tar.gz'));
        var dest = decompress({ ext: '.tar.gz', path: tmp });

        src.pipe(dest);

        dest.on('close', function () {
            cb(assert.ok(fs.existsSync(path.join(tmp, 'test.jpg'))));
        });
    });

    it('should extract .zip with strip option', function (cb) {
        var tmp = path.join(__dirname, 'tmp');
        var src = fs.createReadStream(path.join(__dirname, 'fixtures/test-strip.zip'));
        var dest = decompress({ ext: '.zip', path: tmp, strip: '1' });

        src.pipe(dest);

        dest.on('close', function () {
            cb(assert.ok(fs.existsSync(path.join(tmp, 'test-strip.jpg'))));
        });
    });

    it('should extract .zip with and set mode 0777', function (cb) {
        var tmp = path.join(__dirname, 'tmp');
        var src = fs.createReadStream(path.join(__dirname, 'fixtures/test.zip'));
        var dest = decompress({ ext: '.zip', path: tmp, mode: '0777' });

        src.pipe(dest);

        dest.on('close', function () {
            cb(assert.equal(fs.statSync(path.join(tmp, 'test.jpg')).mode.toString(8), 100755));
        });
    });
});
