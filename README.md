# decompress

Easily extract `.zip`, `.tar` and `.tar.gz` archives. Based on the extract 
utility in Bower.

## Getting started

Install with [npm](https://npmjs.org/package/decompress): `npm install decompress`

## Examples

```js
var decompress = require('decompress');
var fs = require('fs');

fs.createReadStream('foo.tar.gz')
.pipe(decompress.extract({ type: '.tar.gz', path: 'bar' }));
```

## API

### decompress.extract(opts)

Extract an archive using the `type` option to determine which extractor to use.

### decompress.canExtract(file)

Determine if the file can be extracted or not.

```js
decompress.canExtract('foo.zip');
// => true
```

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License) (c) [Kevin Mårtensson](http://kevinmartensson.com)
