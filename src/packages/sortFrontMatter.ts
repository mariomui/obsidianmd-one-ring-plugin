import { App, TFile, Vault, Workspace } from "obsidian";
import type { MarkdownParser } from "src/parser/MarkdownParser";
import type { Variant } from "src/parser/MarkdownParser.types";

type ManuSortFrontMatterConfigSpec = {
	workspace: Workspace;
	vault: Vault;
};
export function manuSortFrontMatterConfig(
	config: Partial<ManuSortFrontMatterConfigSpec> = {}
) {
	const fig = {
		workspace: {},
		vault: {},
	};
	Object.assign(fig, config);
	return fig;
}

function sortFrontMatter(config = manuSortFrontMatterConfig()) {
	const { workspace, vault } = config;
	this.workspace = workspace;
	this.vault = vault;
}

// new (value: string) => MyClass, value: string)
async function genSortFrontMatterWithinContents(
	tFile: TFile,
	sortBy: (a: Variant, b: Variant) => number,
	Parser: new (
		app: App,
		tFile: TFile,
		file_contents: string
	) => MarkdownParser
): Promise<{ data: string; err: Error | null }> {
	const app = this.app;
	return new Promise((res, rej) => {
		this.vault.process(tFile, (file_contents: string) => {
			if (!Parser) {
				console.error("Parser is missing.");
				return file_contents;
			}

			// https://regex101.com/r/7s4zjQ/1
			const regexStart = /^---(\r?\n)/g;
			// https://regex101.com/r/nx0lIA/1
			const regexEnd = /---(\r?\n|$)/g;
			const parser = new Parser(app, tFile, file_contents);
			const processed = parser.splitIntoFrontMatterAndContents(
				parser.file_contents,
				regexStart,
				regexEnd
			);
			if (!processed) {
				res({
					data: parser.file_contents,
					err: new Error("Frontmatter processing error occurred."),
				});
				return file_contents;
			}

			const { processedFrontMatter, processedNonFrontMatter } = processed;

			const sorted_file_contents =
				parser.replaceFileContentsWithSortedFrontMatter(
					processedFrontMatter.frontMatter || "",
					processedNonFrontMatter.content || "",
					sortBy
				);

			res({ data: sorted_file_contents, err: null });
			return sorted_file_contents;
		});
	});
}

async function genSortFrontmatter(
	datums: unknown[],
	sortBy: (...args: unknown[]) => boolean
): Promise<void> {
	await this.genSortFrontMatterWithinContents(
		this.workspace.getActiveFile(),
		sortBy
	);
}

sortFrontMatter.prototype.genSortFrontMatterWithinContents =
	genSortFrontMatterWithinContents;

sortFrontMatter.genSortFrontmatter = genSortFrontmatter;

export { sortFrontMatter };
