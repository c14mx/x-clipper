import {App, Modal, Notice, Plugin} from 'obsidian';
import {DEFAULT_SETTINGS, XClipperSettings, XClipperSettingTab} from "./settings";
import {extractXPostId, generateFilename} from "./utils";
import {fetchXPost} from "./fetch-x-post";
import {generateMarkdown} from "./markdown";

export default class XClipperPlugin extends Plugin {
	settings: XClipperSettings;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon('paperclip', 'Clip X post', () => {
			this.openClipModal();
		});

		this.addCommand({
			id: 'clip-x-post',
			name: 'Clip X post',
			callback: () => {
				this.openClipModal();
			}
		});

		this.addSettingTab(new XClipperSettingTab(this.app, this));
	}

	private openClipModal() {
		if (!this.settings.bearerToken) {
			new Notice('Please set your API bearer token in the X clipper plugin settings.');
			return;
		}
		new ClipModal(this.app, this).open();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<XClipperSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class ClipModal extends Modal {
	private plugin: XClipperPlugin;
	private urlInput: HTMLInputElement;
	private errorEl: HTMLElement;
	private submitBtn: HTMLButtonElement;

	constructor(app: App, plugin: XClipperPlugin) {
		super(app);
		this.plugin = plugin;
		this.containerEl.addClass('x-clipper-modal');
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.empty();

		contentEl.createEl('h2', {text: 'Clip X post'});

		this.urlInput = contentEl.createEl('input', {
			type: 'text',
			cls: 'x-clipper-input',
			attr: {placeholder: 'https://x.com/user/status/...'}
		});

		this.urlInput.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				void this.handleSubmit();
			}
		});

		const btnContainer = contentEl.createDiv({cls: 'x-clipper-actions'});

		this.errorEl = btnContainer.createDiv({cls: 'x-clipper-error'});

		const buttonGroup = btnContainer.createDiv({cls: 'x-clipper-button-group'});

		const cancelBtn = buttonGroup.createEl('button', {text: 'Cancel', cls: 'mod-muted'});
		cancelBtn.addEventListener('click', () => this.close());

		this.submitBtn = buttonGroup.createEl('button', {text: 'Clip', cls: 'mod-cta'});
		this.submitBtn.addEventListener('click', () => void this.handleSubmit());
	}

	private async handleSubmit() {
		const url = this.urlInput.value.trim();
		this.errorEl.classList.remove('is-visible');

		if (!url) {
			this.showError('Please provide a valid x.com url');
			return;
		}

		let postId: string;
		try {
			postId = extractXPostId(url);
		} catch {
			this.showError('Please provide a valid x.com url');
			return;
		}

		this.submitBtn.disabled = true;
		this.submitBtn.setText('Clipping...');

		try {
			const post = await fetchXPost(postId, this.plugin.settings.bearerToken);
			const markdown = generateMarkdown(post);

			const postContent = post.note_tweet?.text ?? post.text;
			const isOnlyTcoLink = /^https:\/\/t\.co\/\S+$/.test(postContent.trim());
			const textForFilename = isOnlyTcoLink ? undefined : postContent;
			let filename = generateFilename(post.author.name, textForFilename, post.article?.title);

			const savePath = this.plugin.settings.savePath.trim();
			const folder = savePath || '';
			const getFilePath = (name: string) => folder ? `${folder}/${name}.md` : `${name}.md`;

			let filepath = getFilePath(filename);

			if (folder && !this.app.vault.getAbstractFileByPath(folder)) {
				await this.app.vault.createFolder(folder);
			}

			if (this.app.vault.getAbstractFileByPath(filepath)) {
				filename = `${filename} ${postId}`;
				filepath = getFilePath(filename);
			}

			await this.app.vault.create(filepath, markdown);
			new Notice(`Clipped: ${filename}`);
			this.close();
		} catch (e: unknown) {
			this.showError(e instanceof Error ? e.message : String(e));
			this.submitBtn.disabled = false;
			this.submitBtn.setText('Clip');
		}
	}

	private showError(message: string) {
		this.errorEl.setText(message);
		this.errorEl.classList.add('is-visible');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
