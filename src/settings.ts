import { App, PluginSettingTab, Setting } from "obsidian";
import XClipperPlugin from "./main";

export interface XClipperSettings {
	bearerToken: string;
	savePath: string;
}

export const DEFAULT_SETTINGS: XClipperSettings = {
	bearerToken: '',
	savePath: ''
}

export class XClipperSettingTab extends PluginSettingTab {
	plugin: XClipperPlugin;

	constructor(app: App, plugin: XClipperPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		this.containerEl.empty();

		new Setting(this.containerEl)
			.setName('X API bearer token')
			.setDesc('App-only authentication bearer token from your X developer console')
			.addText(text => {
				text.inputEl.type = 'password';
				text.setPlaceholder('Bearer token')
					.setValue(this.plugin.settings.bearerToken)
					.onChange(async (value) => {
						this.plugin.settings.bearerToken = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(this.containerEl)
			.setName('Folder path')
			.setDesc('Path to the folder where X clips are saved')
			.addText(text => text
				.setPlaceholder('Clippings')
				.setValue(this.plugin.settings.savePath)
				.onChange(async (value) => {
					this.plugin.settings.savePath = value;
					await this.plugin.saveSettings();
				}));
	}
}
