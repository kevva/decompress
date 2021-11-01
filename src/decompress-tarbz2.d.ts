declare module 'decompress-tarbz2' {
	import { File } from 'decompress';
	export default function decompressTarbz2(): (input: Buffer, opts?: any) => Promise<File[]>;
}
