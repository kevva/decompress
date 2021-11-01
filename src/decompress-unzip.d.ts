declare module 'decompress-unzip' {
	import { File } from 'decompress';
	export default function decompressUnzip(): (input: Buffer, opts?: any) => Promise<File[]>;
}
