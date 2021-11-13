@xingrz/decompress [![test](https://github.com/xingrz/decompress/actions/workflows/test.yml/badge.svg)](https://github.com/xingrz/decompress/actions/workflows/test.yml)
==========

[![][npm-version]][npm-url] [![][npm-downloads]][npm-url] [![license][license-img]][license-url] [![issues][issues-img]][issues-url] [![stars][stars-img]][stars-url] [![commits][commits-img]][commits-url]

Extracting archives made easy.

## Plugins

| package                                 | version         | format      |
| --------------------------------------- | --------------- | ----------- |
| [@xingrz/decompress-tar][tar-url]       | ![][tar-img]    | `*.tar`     |
| [@xingrz/decompress-tarbz2][tarbz2-url] | ![][tarbz2-img] | `*.tar.bz2` |
| [@xingrz/decompress-targz][targz-url]   | ![][targz-img]  | `*.tar.gz`  |
| [@xingrz/decompress-tarzst][tarzst-url] | ![][tarzst-img] | `*.tar.zst` |
| [@xingrz/decompress-unzip][unzip-url]   | ![][unzip-img]  | `*.zip`     |

[tar-url]: https://github.com/xingrz/decompress-tar
[tar-img]: https://img.shields.io/npm/dependency-version/@xingrz/decompress/@xingrz/decompress-tar?label=npm&style=flat-square

[tarbz2-url]: https://github.com/xingrz/decompress-tarbz2
[tarbz2-img]: https://img.shields.io/npm/dependency-version/@xingrz/decompress/@xingrz/decompress-tarbz2?label=npm&style=flat-square

[targz-url]: https://github.com/xingrz/decompress-targz
[targz-img]: https://img.shields.io/npm/dependency-version/@xingrz/decompress/@xingrz/decompress-targz?label=npm&style=flat-square

[tarzst-url]: https://github.com/xingrz/decompress-tarzst
[tarzst-img]: https://img.shields.io/npm/dependency-version/@xingrz/decompress/@xingrz/decompress-tarzst?label=npm&style=flat-square

[unzip-url]: https://github.com/xingrz/decompress-unzip
[unzip-img]: https://img.shields.io/npm/dependency-version/@xingrz/decompress/@xingrz/decompress-unzip?label=npm&style=flat-square

#### Plugin API

[![](https://img.shields.io/npm/dependency-version/@xingrz/decompress/@xingrz/decompress-types?style=flat-square)](https://github.com/xingrz/decompress-types)

## Install

```sh
npm install --save @xingrz/decompress
```

## Usage

```ts
import decompress from 'decompress';

const files = await decompress('unicorn.zip', 'dist');
console.log('done!');
```

## API

### `decompress(input[, output][, options])`

Returns a Promise for an array of [`File`](https://github.com/xingrz/decompress-types/blob/master/index.d.ts#L3)s in the following format:

```ts
interface File {
	path: string;
	type: 'file' | 'link' | 'symlink' | 'directory';
	mode: number;
	mtime: Date | string;
	data?: Buffer;
}
```

If `output` is not presented, `data` will be populated with the content of the file. Otherwise the file will be written to disk and the `data` will be undefined.

#### `input`

Type: `string` | `Buffer`

Path of file or `Buffer` to decompress.

#### `output`

Type: `string` (optional)

Path to output directory.

#### `options`

##### `filter`

Type: `(file: File) => boolean`

Filter out files before extracting. E.g:

```ts
const files = await decompress('unicorn.zip', 'dist', {
	filter: file => path.extname(file.path) !== '.exe'
});
console.log('done!');
```

*Note that in the current implementation, **`filter` is only applied after fully reading all files from the archive in memory**. Do not rely on this option to limit the amount of memory used by `decompress` to the size of the files included by `filter`. `decompress` will read the entire compressed file into memory regardless.*

##### `map`

Type: `(file: File) => File`

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

##### `plugins`

Type: `DecompressPlugin[]`

Array of [plugins](#plugins) to use. See [@xingrz/decompress-types](https://github.com/xingrz/decompress-types/blob/master/index.d.ts) for full definitions.

##### `strip`

Type: `number` (default: `0`)

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
