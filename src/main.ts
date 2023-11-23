import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Plugin,
	PluginManifest,
	PluginSettingTab,
	Setting,
	TFile,
	Vault,
	Workspace,
} from "obsidian";
import { MarkdownParser } from "./parser/MarkdownParser";
import { Variant } from "./parser/MarkdownParser.types";
import { sortBy } from "./utils";

interface MyPluginSettings {
	prefix: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	prefix: "",
};
let workspace: Workspace,
	// fileManager: FileManager,
	vault: Vault;
export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	constructor(app: App, plugin: PluginManifest) {
		super(app, plugin);

		// fileManager = this.app.fileManager;
		workspace = this.app.workspace;
		vault = this.app.vault;
	}

	async #genSortFrontMatterWithinContents(
		tFile: TFile,
		sortBy: (a: Variant, b: Variant) => number
	): Promise<{ data: string; err: Error | null }> {
		const app = this.app;
		return new Promise((res, rej) => {
			vault.process(tFile, (file_contents) => {
				// https://regex101.com/r/7s4zjQ/1
				const regexStart = /^---(\r?\n)/g;
				// https://regex101.com/r/nx0lIA/1
				const regexEnd = /---(\r?\n|$)/g;
				const parser = new MarkdownParser(app, tFile, file_contents);
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

	public async genSortFrontmatter(datums: unknown[]): Promise<void> {
		await this.#genSortFrontMatterWithinContents(
			workspace.getActiveFile(),
			sortBy
		);
	}

	async addUuid() {
		// Create a index UID with the current timestamp, and a random number
		const uuid = this.settings.prefix + self.crypto.randomUUID();
		return uuid;
	}

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		this.app.templaterAddOnFig = {
			addUuid: () => {},
		};
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		this.app.templaterAddOnFig.addUuid = async () => {
			return await this.addUuid();
		};
		this.addCommand({
			id: "uuid",
			name: "check uuid",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const uuid = await this.addUuid();
				const cursor = editor.getCursor();
				editor.replaceRange(uuid, cursor);
			},
		});
		// TODO switch this command out with using my sort frontmatter plugin so i can delete code
		this.addCommand({
			id: "sort frontmatter",
			name: "dont use  me Sort frontmatter",
			callback: async (...args) => {
				await this.genSortFrontmatter(args);
			},
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "sample-editor-command",
			name: "Sample editor command",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection("Sample Editor Command");
			},
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: "open-sample-modal-complex",
			name: "Open sample modal (complex)",
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			},
		});
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

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Woah!");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Settings for my awesome plugin." });

		new Setting(containerEl)
			.setName("PREFIX")
			.setDesc("Prefix for uuid")
			.addText((text) =>
				text
					.setPlaceholder("Enter your prefix")
					.setValue(this.plugin.settings.prefix)
					.onChange(async (value) => {
						console.log("Secret: " + value);
						this.plugin.settings.prefix = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
