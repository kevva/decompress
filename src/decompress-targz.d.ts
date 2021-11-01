declare module 'decompress-targz' {
	import { File } from 'decompress';
	export default function decompressTargz(): (input: Buffer, opts?: any) => Promise<File[]>;
}
