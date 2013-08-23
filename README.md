# decompress [![Build Status](https://secure.travis-ci.org/kevva/decompress.png?branch=master)](http://travis-ci.org/kevva/decompress)

Easily extract `.zip`, `.tar` and `.tar.gz` archives. Based on the extract
utility in [Bower](https://github.com/bower/bower).

## Getting started

Install with [npm](https://npmjs.org/package/decompress): `npm install decompress`

## Examples

You'll only need to give decompress a `type` and it'll figure the rest out for
you.

```js
var decompress = require('decompress');
var fs = require('fs');

fs.createReadStream('foo.tar.gz')
.pipe(decompress.extract({ type: '.tar.gz', path: 'bar' }));
```

## API

### decompress.extract(opts)

Extract an archive using the `type` option to determine which extractor to use. If no `path` is specified it'll extract it to your current location.

### decompress.canExtract(src, mime)

Determine if a file can be extracted or not by checking the file extension
and/or the MIME type.

```js
decompress.canExtract('foo.zip');
// => true

decompress.canExtract('application/zip');
// => true
```

## Options

* `type` — String that can be a file name, URL or a MIME type for example.
* `path` — Path to extract the archive to. If no `path` is specified it'll 
extract it to your current location.

You can also define options accepted by the different extractors. See [unzip](https://github.com/nearinfinity/node-unzip/) and [tar](https://github.com/isaacs/node-tar/)
for more information.

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License) (c) [Kevin Mårtensson](http://kevinmartensson.com)
