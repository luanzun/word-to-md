import { App, PluginSettingTab } from 'obsidian';
import WordToMdPlugin from './main';
export interface WordToMdSettings {
    outputFolder: string;
    imageFolderName: string;
    includeProperties: boolean;
    overwriteExisting: boolean;
    showProgress: boolean;
    language: string;
}
export declare const DEFAULT_SETTINGS: WordToMdSettings;
export declare class WordToMdSettingsTab extends PluginSettingTab {
    plugin: WordToMdPlugin;
    constructor(app: App, plugin: WordToMdPlugin);
    display(): void;
}
//# sourceMappingURL=settings.d.ts.map