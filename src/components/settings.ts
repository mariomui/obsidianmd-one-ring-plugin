import { App, Modal, PluginSettingTab, Setting } from "obsidian";
import MyPlugin from "src/main";

export class SampleModal extends Modal {
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

export class SampleSettingTab extends PluginSettingTab {
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
