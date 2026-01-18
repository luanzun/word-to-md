import { Plugin, TFile, TFolder } from 'obsidian';
import { WordToMdSettings, WordToMdSettingsTab, DEFAULT_SETTINGS } from './settings';
import { WordConverter } from './converter';
import { I18n } from './i18n';

export default class WordToMdPlugin extends Plugin {
  settings: WordToMdSettings = DEFAULT_SETTINGS;
  converter!: WordConverter;
  i18n!: I18n;

  async onload() {
    await this.loadSettings();

    // Initialize i18n with the appropriate language
    this.i18n = new I18n(this.settings.language);

    // Set the language, passing the app instance for auto-detection
    this.i18n.setLanguage(this.settings.language, this.app);

    this.converter = new WordConverter(this);

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new WordToMdSettingsTab(this.app, this));

    // This adds a command to convert a single word document
    this.addCommand({
      id: 'convert-word-document',
      name: this.i18n.t('convertSingleCommand'),
      callback: () => {
        void this.converter.showSingleFilePicker();
      }
    });

    // This adds a command to convert all word documents in a folder
    this.addCommand({
      id: 'convert-all-word-documents-in-folder',
      name: this.i18n.t('convertFolderCommand'),
      callback: () => {
        this.converter.showFolderPicker();
      }
    });

    // This adds a menu item to the file explorer context menu
    this.registerEvent(
      this.app.workspace.on('file-menu', (menu, file) => {
        if (file instanceof TFile && (file.extension === 'docx' || file.extension === 'doc')) {
          menu.addItem((item) => {
            item
              .setTitle(this.i18n.t('convertToMarkdown'))
              .setIcon('document')
              .onClick(async () => {
                await this.converter.convertSingleFile(file);
              });
          });
        } else if (file instanceof TFolder) {
          menu.addItem((item) => {
            item
              .setTitle(this.i18n.t('convertAllWordFiles'))
              .setIcon('documents')
              .onClick(async () => {
                await this.converter.convertFolder(file);
              });
          });
        }
      })
    );
  }

  onunload() {
    // console.debug('Word to MD plugin unloaded');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
