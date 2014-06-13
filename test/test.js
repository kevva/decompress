/*global afterEach, describe, it */
'use strict';

var assert = require('assert');
var Decompress = require('../');
var fs = require('fs');
var path = require('path');
var rm = require('rimraf');

describe('decompress()', function () {
    afterEach(function (cb) {
        rm(path.join(__dirname, 'tmp'), cb);
    });

    it('should extract .tar', function (cb) {
        var decompress = new Decompress();

        decompress
            .src(path.join(__dirname, 'fixtures/test.tar'))
            .dest(path.join(__dirname, 'tmp'))
            .use(Decompress.tar())
            .decompress(function (err) {
                assert(!err);
                assert(fs.existsSync(path.join(__dirname, 'tmp/test.jpg')));
                cb();
            });
    });

    it('should extract .tar.gz', function (cb) {
        var decompress = new Decompress();

        decompress
            .src(path.join(__dirname, 'fixtures/test.tar.gz'))
            .dest(path.join(__dirname, 'tmp'))
            .use(Decompress.targz())
            .decompress(function (err) {
                assert(!err);
                assert(fs.existsSync(path.join(__dirname, 'tmp/test.jpg')));
                cb();
            });
    });

    it('should extract .zip', function (cb) {
        var decompress = new Decompress();

        decompress
            .src(path.join(__dirname, 'fixtures/test.zip'))
            .dest(path.join(__dirname, 'tmp'))
            .use(Decompress.zip())
            .decompress(function (err) {
                assert(!err);
                assert(fs.existsSync(path.join(__dirname, 'tmp/test.jpg')));
                cb();
            });
    });

    it('should extract .zip using the strip option', function (cb) {
        var decompress = new Decompress();

        decompress
            .src(path.join(__dirname, 'fixtures/test-strip.zip'))
            .dest(path.join(__dirname, 'tmp'))
            .use(Decompress.zip({ strip: 1 }))
            .decompress(function (err) {
                assert(!err);
                assert(fs.existsSync(path.join(__dirname, 'tmp/test.jpg')));
                cb();
            });
    });
});
