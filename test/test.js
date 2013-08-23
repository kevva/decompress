/*global describe, it, afterEach */
'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var decompress = require('../decompress');
var tmp = path.join(__dirname, 'tmp');

describe('decompress.canExtract()', function () {
    it('can extract .zip', function () {
        assert.equal(decompress.canExtract('.zip'), true);
    });
    it('can extract application/zip', function () {
        assert.equal(decompress.canExtract('application/zip'), true);
    });
    it('can\'t extract .rar', function () {
        assert.equal(decompress.canExtract('.rar'), false);
    });
    it('can\'t extract application/x-rar-compressed', function () {
        assert.equal(decompress.canExtract('application/x-rar-compressed'), false);
    });
});

describe('decompress.extract()', function () {
    afterEach(function () {
        if (fs.existsSync(path.join(tmp, 'test.jpg'))) {
            fs.unlinkSync(path.join(tmp, 'test.jpg'));
        }
        fs.rmdirSync(tmp);
    });
    it('should extract .zip', function (cb) {
        fs.createReadStream(path.join(__dirname, 'fixtures/test.zip'))
        .pipe(decompress.extract({ type: '.zip', path: tmp }))
        .on('close', function () {
            fs.stat(path.join(tmp, 'test.jpg'), cb);
        });
    });
    it('should extract .tar', function (cb) {
        fs.createReadStream(path.join(__dirname, 'fixtures/test.tar'))
        .pipe(decompress.extract({ type: '.tar', path: tmp }))
        .on('close', function () {
            fs.stat(path.join(tmp, 'test.jpg'), cb);
        });
    });
});
