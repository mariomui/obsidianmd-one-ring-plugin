import { TFile, Vault, Workspace } from "obsidian";
import type { sortBySpec } from "src/parser/MarkdownParser";

import { MarkdownParser } from "src/parser/MarkdownParser";
import { Variant } from "src/parser/MarkdownParser.types";
import { sortBy } from "src/utils";

export class SortFrontMatter {
	workspace: Workspace;
	vault: Vault;
	defaultSortBy: typeof sortBy;

	constructor(workspace: Workspace, vault: Vault) {
		this.workspace = workspace;
		this.vault = vault;

		this.defaultSortBy = sortBy;
	}

	async #genSortFrontMatterWithinContents(
		tFile: TFile,
		sortBy: sortBySpec<Variant>
	): Promise<{ data: string; err: Error | null }> {
		return new Promise((res, rej) => {
			this.vault.process(tFile, (file_contents: string) => {
				// https://regex101.com/r/7s4zjQ/1
				const regexStart = /^---(\r?\n)/g;
				// https://regex101.com/r/nx0lIA/1
				const regexEnd = /---(\r?\n|$)/g;
				const parser = new MarkdownParser(tFile, file_contents);
				const processed = parser.splitIntoFrontMatterAndContents(
					parser.file_contents,
					regexStart,
					regexEnd
				);
				if (!processed) {
					res({
						data: parser.file_contents,
						err: new Error(
							"Frontmatter processing error occurred."
						),
					});
					return file_contents;
				}

				const { processedFrontMatter, processedNonFrontMatter } =
					processed;

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

	public async processGenSortFrontmatter(
		config: Record<string, unknown> = {
			datums: [],
		},
		sortBy = this.defaultSortBy
	): Promise<void> {
		await this.#genSortFrontMatterWithinContents(
			this.workspace.getActiveFile(),
			sortBy
		);
	}
}
