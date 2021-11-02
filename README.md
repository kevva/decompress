@xingrz/decompress [![test](https://github.com/xingrz/decompress/actions/workflows/test.yml/badge.svg)](https://github.com/xingrz/decompress/actions/workflows/test.yml)
==========

[![][npm-version]][npm-url] [![][npm-downloads]][npm-url] [![license][license-img]][license-url] [![issues][issues-img]][issues-url] [![stars][stars-img]][stars-url] [![commits][commits-img]][commits-url]

Extracting archives made easy

*See [decompress-cli](https://github.com/kevva/decompress-cli) for the command-line version.*

## Install

```sh
$ npm install @xingrz/decompress --save
```

## Usage

```ts
import decompress from 'decompress';

const files = await decompress('unicorn.zip', 'dist');
console.log('done!');
```

## API

### decompress(input[, output][, options])

Returns a Promise for an array of files in the following format:

```js
{
	data: Buffer,
	mode: Number,
	mtime: String,
	path: String,
	type: String
}
```

#### input

Type: `string` `Buffer`

File to decompress.

#### output

Type: `string`

Output directory.

#### options

##### filter

Type: `Function`

Filter out files before extracting. E.g:

```ts
const files = await decompress('unicorn.zip', 'dist', {
	filter: file => path.extname(file.path) !== '.exe'
});
console.log('done!');
```

*Note that in the current implementation, **`filter` is only applied after fully reading all files from the archive in memory**. Do not rely on this option to limit the amount of memory used by `decompress` to the size of the files included by `filter`. `decompress` will read the entire compressed file into memory regardless.*

##### map

Type: `Function`

Map files before extracting: E.g:

```ts
const files = await decompress('unicorn.zip', 'dist', {
	map: file => {
		file.path = `unicorn-${file.path}`;
		return file;
	}
});
console.log('done!');
```

##### plugins

Type: `Array`<br>
Default: `[decompressTar(), decompressTarbz2(), decompressTargz(), decompressTarzst(), decompressUnzip()]`

Array of [plugins](https://www.npmjs.com/browse/keyword/decompressplugin) to use.

##### strip

Type: `number`<br>
Default: `0`

Remove leading directory components from extracted files.

## License

MIT © [Kevin Mårtensson](https://github.com/kevva), [XiNGRZ](https://github.com/xingrz)

[npm-version]: https://img.shields.io/npm/v/@xingrz/decompress.svg?style=flat-square
[npm-downloads]: https://img.shields.io/npm/dm/@xingrz/decompress.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@xingrz/decompress
[license-img]: https://img.shields.io/github/license/xingrz/decompress?style=flat-square
[license-url]: LICENSE
[issues-img]: https://img.shields.io/github/issues/xingrz/decompress?style=flat-square
[issues-url]: https://github.com/xingrz/decompress/issues
[stars-img]: https://img.shields.io/github/stars/xingrz/decompress?style=flat-square
[stars-url]: https://github.com/xingrz/decompress/stargazers
[commits-img]: https://img.shields.io/github/last-commit/xingrz/decompress?style=flat-square
[commits-url]: https://github.com/xingrz/decompress/commits/master
