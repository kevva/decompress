declare module 'decompress-tarbz2' {
	import type { DecompressPlugin } from '@xingrz/decompress-types';
	export default function decompressTarbz2(): DecompressPlugin<void>;
}
