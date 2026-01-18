import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
import WordToMdPlugin from './main';

export interface WordToMdSettings {
  outputFolder: string;
  imageFolderName: string;
  includeProperties: boolean;
  overwriteExisting: boolean;
  showProgress: boolean;
  language: string;
  converterType: 'mammoth' | 'pandoc';
  pandocPath: string;
}

export const DEFAULT_SETTINGS: WordToMdSettings = {
  outputFolder: '',
  imageFolderName: '{documentName}_images',
  includeProperties: true,
  overwriteExisting: false,
  showProgress: true,
  language: 'auto',
  converterType: 'mammoth',
  pandocPath: ''
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

    new Setting(containerEl)
      .setName(i18n.t('settingsTitle'))
      .setHeading();

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
          this.plugin.i18n.setLanguage(value, this.plugin.app);
          // Refresh settings page to show translated text
          this.display();
        }));

    // Converter type setting
    new Setting(containerEl)
      .setName(i18n.t('converterTypeName'))
      .setDesc(i18n.t('converterTypeDesc'))
      .addDropdown((dropdown) => dropdown
        .addOption('mammoth', i18n.t('converterTypeMammoth'))
        .addOption('pandoc', i18n.t('converterTypePandoc'))
        .setValue(this.plugin.settings.converterType)
        .onChange(async (value: string) => {
          this.plugin.settings.converterType = value as 'mammoth' | 'pandoc';
          await this.plugin.saveSettings();
          // Refresh settings page to show/hide pandoc path setting
          this.display();
        }));

    // Pandoc path setting (only show when pandoc is selected)
    if (this.plugin.settings.converterType === 'pandoc') {
      const pandocPathSetting = new Setting(containerEl)
        .setName(i18n.t('pandocPathName'))
        .setDesc(i18n.t('pandocPathDesc'))
        .addText((text) => text
          .setPlaceholder(i18n.t('pandocPathPlaceholder'))
          .setValue(this.plugin.settings.pandocPath)
          .onChange(async (value) => {
            this.plugin.settings.pandocPath = value;
            await this.plugin.saveSettings();
          }));

      // Add auto-detect button
      pandocPathSetting.addButton((button) => button
        .setButtonText(i18n.t('autoDetectButton'))
        .onClick(async () => {
          button.setButtonText(i18n.t('detectingButton'));
          button.setDisabled(true);

          try {
            const detectedPath = await this.detectPandocPath();
            if (detectedPath) {
              this.plugin.settings.pandocPath = detectedPath;
              await this.plugin.saveSettings();
              pandocPathSetting.controlEl.querySelector('input')?.setAttribute('value', detectedPath);
              new Notice(i18n.t('pandocDetected', { path: detectedPath }));
            } else {
              new Notice(i18n.t('pandocNotFound'));
            }
          } catch {
            console.error('Error detecting pandoc:');
            new Notice(i18n.t('pandocDetectionFailed'));
          }

          button.setButtonText(i18n.t('autoDetectButton'));
          button.setDisabled(false);
        }));
    }
  }

  // Auto-detect pandoc path
  private async detectPandocPath(): Promise<string | null> {
    const platform = process.platform;
    const commonPaths: string[] = [];

    if (platform === 'win32') {
      // Windows
      commonPaths.push(
        'C:\\Program Files\\Pandoc\\pandoc.exe',
        'C:\\Program Files (x86)\\Pandoc\\pandoc.exe',
        'pandoc.exe'
      );
    } else if (platform === 'darwin') {
      // macOS
      commonPaths.push(
        '/usr/local/bin/pandoc',
        '/opt/homebrew/bin/pandoc',
        'pandoc'
      );
    } else {
      // Linux
      commonPaths.push(
        '/usr/bin/pandoc',
        '/usr/local/bin/pandoc',
        '/snap/bin/pandoc',
        'pandoc'
      );
    }

        // Try to find pandoc in common paths
        for (const path of commonPaths) {
          try {
            const result = await this.execCommand(`"${path}" --version`, 5000);
            if (result.stdout && result.stdout.includes('pandoc')) {
              return path;
            }
          } catch {
            // Continue to next path
          }
        }

    return null;
  }

  // Execute shell command
  private async execCommand(command: string, timeout: number = 10000): Promise<{ stdout: string; stderr: string }> {
    try {
      return await execAsync(command, { timeout, maxBuffer: 1024 * 1024 });
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }
}
