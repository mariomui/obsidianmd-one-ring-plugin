import {
	App,
	Editor,
	EditorPosition,
	MarkdownView,
	Plugin,
	PluginManifest,
} from "obsidian";

import { SampleSettingTab } from "./components/settings";
import { SortFrontMatter } from "./components/SortFrontmatter";
import { pipeMultipleAddCommand } from "./extracts/commands";

interface MyPluginSettings {
	prefix: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	prefix: "",
};

const use = <T>(fig: T) => {
	return new Proxy(fig as Record<string, any>, {
		get(target, prop, receiver) {
			for (const f in fig) {
				if (prop === f) {
					return fig[f];
				}
			}
			return Reflect.get(...[target, prop, receiver]);
		},
	});
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	// # static injections
	figSpecifier: string;

	// # toolbox injections
	sortFrontmatterToolbox: SortFrontMatter;

	constructor(app: App, plugin: PluginManifest) {
		super(app, plugin);
		this.sortFrontmatterToolbox = new SortFrontMatter(
			this.app.workspace,
			this.app.vault
		);
		const useTemplaterAddOnFig = use<{ figSpecifier: string }>({
			figSpecifier: "templaterAddOnFig",
		});
		this.figSpecifier = useTemplaterAddOnFig.figSpecifier;
	}

	async addUuid() {
		// Create a index UID with the current timestamp, and a random number
		const uuid = this.settings.prefix + self.crypto.randomUUID();
		return uuid;
	}

	#doInjectFunctionIntoAddOnFig(
		functionName: string,
		functionImpl: (...args: unknown[]) => unknown
	): void {
		const specifier = this.figSpecifier;
		const isEmpty = !Object.keys(this.app[specifier]) === true;
		if (isEmpty) {
			this.app[specifier] = {};
		}
		// @ts-ignore
		this.app[specifier][functionName] = functionImpl;
	}

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.app.templaterAddOnFig = {};
		this.app.templaterAddOnFig.addUuid = this.addUuid.bind(this);

		// setup all my editor commands
		pipeMultipleAddCommand(this);

		const gem = {
			id: "make quote",
			name: "make quote",
			editorCallback: async function (
				editor: Editor,
				markdownView: MarkdownView
			) {
				console.log({ editor, markdownView });
				console.log(getLastRow(editor, 3));
				console.log({
					cursor: getCursor(editor),
				});
			},
		};

		this.addCommand(gem);

		//https://discuss.codemirror.net/t/what-is-getcursor-ch/6480/2
		function getCursor(editor: Editor): EditorPosition {
			// const from: Line =
			return editor.getCursor();

			// ch is doc.line(pos).from
			// doc: Text
			// line: line(n: number) → Line
			// line https://codemirror.net/docs/ref/#state.Line
			// ergo pos is the index number of the serialized file_contents.
			// from is the very start of the line. :thinkign;
		}

		function getLastRow(editor: Editor, rowNo: number) {
			return editor.lastLine();
		}
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
