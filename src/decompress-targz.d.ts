declare module 'decompress-targz' {
	import type { DecompressPlugin } from '@xingrz/decompress-types';
	export default function decompressTargz(): DecompressPlugin<void>;
}
