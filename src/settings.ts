import { App, PluginSettingTab, Setting } from 'obsidian';
import WordToMdPlugin from './main';

export interface WordToMdSettings {
  outputFolder: string;
  imageFolderName: string;
  includeProperties: boolean;
  overwriteExisting: boolean;
  showProgress: boolean;
  language: string;
}

export const DEFAULT_SETTINGS: WordToMdSettings = {
  outputFolder: '',
  imageFolderName: '{documentName}_images',
  includeProperties: true,
  overwriteExisting: false,
  showProgress: true,
  language: 'auto'
};

export class WordToMdSettingsTab extends PluginSettingTab {
  plugin: WordToMdPlugin;

  constructor(app: App, plugin: WordToMdPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    const i18n = this.plugin.i18n;

    containerEl.empty();

    // new Setting(containerEl)
      // .setName(i18n.t('settingsTitle'))
      // .setHeading();

    // Output folder setting
    new Setting(containerEl)
      .setName(i18n.t('outputFolderName'))
      .setDesc(i18n.t('outputFolderDesc'))
      .addText((text) => text
        .setPlaceholder(i18n.t('outputFolderPlaceholder'))
        .setValue(this.plugin.settings.outputFolder)
        .onChange(async (value) => {
          this.plugin.settings.outputFolder = value;
          await this.plugin.saveSettings();
        }));

    // Image folder name setting
    new Setting(containerEl)
      .setName(i18n.t('imageFolderName'))
      .setDesc(i18n.t('imageFolderDesc'))
      .addText((text) => text
        .setPlaceholder(i18n.t('imageFolderPlaceholder'))
        .setValue(this.plugin.settings.imageFolderName)
        .onChange(async (value) => {
          this.plugin.settings.imageFolderName = value;
          await this.plugin.saveSettings();
        }));

    // Include properties setting
    new Setting(containerEl)
      .setName(i18n.t('includePropertiesName'))
      .setDesc(i18n.t('includePropertiesDesc'))
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings.includeProperties)
        .onChange(async (value) => {
          this.plugin.settings.includeProperties = value;
          await this.plugin.saveSettings();
        }));

    // Overwrite existing files setting
    new Setting(containerEl)
      .setName(i18n.t('overwriteExistingName'))
      .setDesc(i18n.t('overwriteExistingDesc'))
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings.overwriteExisting)
        .onChange(async (value) => {
          this.plugin.settings.overwriteExisting = value;
          await this.plugin.saveSettings();
        }));

    // Show progress setting
    new Setting(containerEl)
      .setName(i18n.t('showProgressName'))
      .setDesc(i18n.t('showProgressDesc'))
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings.showProgress)
        .onChange(async (value) => {
          this.plugin.settings.showProgress = value;
          await this.plugin.saveSettings();
        }));

    // Language setting
    new Setting(containerEl)
      .setName(i18n.t('languageName'))
      .setDesc(i18n.t('languageDesc'))
      .addDropdown((dropdown) => dropdown
        .addOption('auto', 'Auto (use Obsidian language)')
        .addOption('en', 'English')
        .addOption('zh', '中文')
        .setValue(this.plugin.settings.language)
        .onChange(async (value: string) => {
          this.plugin.settings.language = value;
          await this.plugin.saveSettings();
          // Update i18n instance with new language, passing app for auto-detection
          this.plugin.i18n.setLanguage(value, this.plugin.app as unknown);
          // Refresh settings page to show translated text
          this.display();
        }));
  }
}
