'use strict';

var assert = require('assert');
var Decompress = require('../');
var fs = require('fs');
var path = require('path');
var rm = require('rimraf');
var test = require('ava');

test('extract .tar', function (t) {
    var decompress = new Decompress()
        .src(path.join(__dirname, 'fixtures/test.tar'))
        .dest(path.join(__dirname, 'tmp'))
        .use(Decompress.tar());

    decompress.decompress(function (err) {
        t.assert(!err);

        fs.exists(path.join(decompress.dest(), 'test.jpg'), function (exists) {
            t.assert(exists);

            rm(decompress.dest(), function (err) {
                t.assert(!err);
            });
        });
    });
});

test('extract .tar.gz', function (t) {
    var decompress = new Decompress()
        .src(path.join(__dirname, 'fixtures/test.tar.gz'))
        .dest(path.join(__dirname, 'tmp'))
        .use(Decompress.targz());

    decompress.decompress(function (err) {
        t.assert(!err);

        fs.exists(path.join(decompress.dest(), 'test.jpg'), function (exists) {
            t.assert(exists);

            rm(decompress.dest(), function (err) {
                t.assert(!err);
            });
        });
    });
});

test('extract .zip', function (t) {
    var decompress = new Decompress()
        .src(path.join(__dirname, 'fixtures/test.zip'))
        .dest(path.join(__dirname, 'tmp'))
        .use(Decompress.zip());

    decompress.decompress(function (err) {
        t.assert(!err);

        fs.exists(path.join(decompress.dest(), 'test.jpg'), function (exists) {
            t.assert(exists);

            rm(decompress.dest(), function (err) {
                t.assert(!err);
            });
        });
    });
});

test('extract .zip using the strip option', function (t) {
    var decompress = new Decompress()
        .src(path.join(__dirname, 'fixtures/test-strip.zip'))
        .dest(path.join(__dirname, 'tmp'))
        .use(Decompress.zip({ strip: 1 }));

    decompress.decompress(function (err) {
        t.assert(!err);

        fs.exists(path.join(decompress.dest(), 'test-strip.jpg'), function (exists) {
            t.assert(exists);

            rm(decompress.dest(), function (err) {
                t.assert(!err);
            });
        });
    });
});

test('extract .zip and set mode on extracted file', function (t) {
    var decompress = new Decompress({ mode: 777 })
        .src(path.join(__dirname, 'fixtures/test.zip'))
        .dest(path.join(__dirname, 'tmp'))
        .use(Decompress.zip());

    decompress.decompress(function (err) {
        t.assert(!err);

        fs.stat(path.join(decompress.dest(), 'test.jpg'), function (err, stats) {
            t.assert(!err);
            t.assert(stats.mode.toString(8) === '100777');

            rm(decompress.dest(), function (err) {
                t.assert(!err);
            });
        });
    });
});
