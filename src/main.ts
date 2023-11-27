import { App, Editor, MarkdownView, Plugin, PluginManifest } from "obsidian";

import { SampleSettingTab } from "./components/settings";
import { SortFrontMatter } from "./components/SortFrontmatter";
import { pipeMultipleAddCommand } from "./archive/commands";

interface MyPluginSettings {
	prefix: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	prefix: "",
};

const use = <T>(fig: T) => {
	return new Proxy(fig as Record<string, unknown>, {
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
const useTemplaterAddOnFig = use<{ figSpecifier: string }>({
	figSpecifier: "templaterAddOnFig",
});

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;
	figSpecifier = useTemplaterAddOnFig.figSpecifier as string;

	sortFrontmatterToolbox: SortFrontMatter;
	constructor(app: App, plugin: PluginManifest) {
		super(app, plugin);
		this.sortFrontmatterToolbox = new SortFrontMatter(
			this.app.workspace,
			this.app.vault
		);
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
		const isEmpty = !Object.keys(this.app[specifier]);
		if (isEmpty) {
			this.app[specifier] = {};
		}
		// @ts-ignore
		this.app[specifier][functionName] = functionImpl;
	}

	onload = async () => {
		await this.loadSettings();
		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.#doInjectFunctionIntoAddOnFig("addUuid", this.addUuid.bind(this));

		this.addCommand({
			id: "uuid",
			name: "check uuid",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const uuid = await this.addUuid();
				const cursor = editor.getCursor();
				editor.replaceRange(uuid, cursor);
			},
		});

		// This adds an editor command that can perform some operation on the current editor instance
		pipeMultipleAddCommand(this);
	};

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
