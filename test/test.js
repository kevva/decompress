/*global describe, it, before, afterEach */
'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var decompress = require('../decompress');

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
    before(function () {
        this.tmp = path.join(__dirname, 'tmp');
    });
    afterEach(function () {
        if (fs.existsSync(path.join(this.tmp, 'test.jpg'))) {
            fs.unlinkSync(path.join(this.tmp, 'test.jpg'));
        }
        fs.rmdirSync(this.tmp);
    });
    it('should extract .zip', function (cb) {
        var self = this;
        var file = fs.createReadStream(path.join(__dirname, 'fixtures/test.zip'));

        file.pipe(decompress.extract({ type: '.zip', path: this.tmp }))
        .on('close', function () {
            fs.stat(path.join(self.tmp, 'test.jpg'), cb);
        });
    });
    it('should extract .tar', function (cb) {
        var self = this;
        var file = fs.createReadStream(path.join(__dirname, 'fixtures/test.tar'));

        file.pipe(decompress.extract({ type: '.tar', path: this.tmp }))
        .on('close', function () {
            fs.stat(path.join(self.tmp, 'test.jpg'), cb);
        });
    });
});
