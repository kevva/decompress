declare module 'strip-dirs' {
	interface StripDirsOptions {
		disallowOverflow?: boolean;
	}

	export default function stripDirs(path: string, count: number, option?: StripDirsOptions): string;
}
