# decompress [![Build Status](https://travis-ci.org/kevva/decompress.svg?branch=master)](https://travis-ci.org/kevva/decompress)

> Easily extract archives

## Install

```bash
$ npm install --save decompress
```

## Usage

```js
var Decompress = require('decompress');
var decompress = new Decompress()
    .src('foo.zip')
    .dest('destFolder')
    .use(Decompress.zip({ strip: 1 }));

decompress.decompress();
```

## License

MIT © [Kevin Mårtensson](http://kevinmartensson.com)
