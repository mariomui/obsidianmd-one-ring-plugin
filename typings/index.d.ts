declare module "['copy-newer']" {
	export default function copyNewer(
		braced_target_files: string,
		dir: string,
		options: unknown
	): Promise<void>;
	// export = {
	// 	default: copyNewer,
	// };
}

declare module "js-yaml" {
	export interface YamlConfig {
		[key: string]: unknown;
	}

	export function dump(
		obj: Record<string, unknown>,
		options?: YamlConfig
	): string;
}
export type TemplaterAddOnFigSpec = {
	addUuid?: () => Promise<string>;
};

declare module "obsidian" {
	export interface App extends Record<string, unknown | string> {
		templaterAddOnFig?: TemplaterAddOnFigSpec;
	}
}
