declare module 'decompress-tar' {
	import { File } from 'decompress';
	export default function decompressTar(): (input: Buffer, opts?: any) => Promise<File[]>;
}
