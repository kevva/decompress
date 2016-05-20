# decompress [![Build Status](https://travis-ci.org/kevva/decompress.svg?branch=master)](https://travis-ci.org/kevva/decompress)

> Extracting archives made easy

*See [decompress-cli](https://github.com/kevva/decompress-cli) for the command-line version.*

## Install

```
$ npm install --save decompress
```


## Usage

```js
const decompress = require('decompress');

decompress('unicorn.zip', 'dist').then(files => {
	console.log('done!');
});
```


## API

### decompress(input, [output], [options])

#### input

Type: `string` `Buffer`

File to decompress.

#### output

Type: `string`

Output directory.

#### options

##### plugins

Type: `array`  
Default: `[decompressTar(), decompressTarGz(), decompressUnzip()]`

Array of [plugins](https://www.npmjs.com/browse/keyword/decompressplugin) to use.

##### strip

Type: `number`  
Default: `0`

Remove leading directory components from extracted files.


## License

MIT © [Kevin Mårtensson](https://github.com/kevva)
