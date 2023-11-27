// import { replaceTextGemCommand } from "./commands";

import { Command, Editor, MarkdownView } from "obsidian";
import MyPlugin from "src/main";

export const replaceTextGem = {
	id: "sample-editor-command",
	name: "Sample editor command",
	editorCallback: (editor: Editor, view: MarkdownView) => {
		console.log(editor.getSelection());
		console.log("hey");
		editor.replaceSelection("Sample Editor Command");
	},
};
export const sortFrontMatterGem = {
	id: "sort frontmatter",
	name: "dont use  me Sort frontmatter",
	callback: async function (...args: unknown[]) {
		console.log({ args });
		console.log(this.sortFrontmatterToolbox, "tapestry");
		await this.sortFrontmatterToolbox.processGenSortFrontmatter({
			datums: args,
		});
	},
};
type commandSpec = ReturnType<typeof createGemCommand>;
const _commands: commandSpec[] = [];

export function pipeMultipleAddCommand(ctx: MyPlugin) {
	const replaceTextGemCommand = createGemCommand.call(ctx, replaceTextGem);

	const sortFrontMatterGemCommand = createGemCommand.call(
		ctx,
		sortFrontMatterGem
	);
	console.log({ ctx }, 3);
	doAddCommand.call(ctx, replaceTextGemCommand.bind(ctx));
	doAddCommand.call(ctx, sortFrontMatterGemCommand.bind(ctx));

	for (const command of _commands) {
		command.call(ctx, ctx);
	}
}

export function doAddCommand(fn: (...args: any[]) => void) {
	_commands.push(fn);
}

export function createGemCommand(gem: Command) {
	return function (ctx: MyPlugin) {
		if (gem.callback) {
			gem.callback = gem.callback.bind(ctx);
		}
		ctx.addCommand(gem);
	};
}
