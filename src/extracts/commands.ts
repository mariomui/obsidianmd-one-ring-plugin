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

export const addUuidGem = {
	id: "uuid",
	name: "check uuid",
	editorCallback: async function (editor: Editor, view: MarkdownView) {
		const uuid = await this.addUuid();
		const cursor = editor.getCursor();
		editor.replaceRange(uuid, cursor);
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
	const addUuidGemCommand = createGemCommand.call(ctx, addUuidGem);

	doAddCommand.call(ctx, replaceTextGemCommand.bind(ctx));
	doAddCommand.call(ctx, sortFrontMatterGemCommand.bind(ctx));
	doAddCommand.call(ctx, addUuidGemCommand.bind(ctx));
	for (const command of _commands) {
		command.call(ctx, ctx);
	}
}

export function doAddCommand(fn: (...args: unknown[]) => void) {
	_commands.push(fn);
}

export function createGemCommand(gem: Command) {
	return function (ctx: MyPlugin) {
		if (gem.callback) {
			gem.callback = gem.callback.bind(ctx);
		}
		if (gem.editorCallback) {
			gem.editorCallback = gem.editorCallback.bind(ctx);
		}
		ctx.addCommand(gem);
	};
}
