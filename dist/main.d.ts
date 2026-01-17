import { Plugin } from 'obsidian';
import { WordToMdSettings } from './settings';
import { WordConverter } from './converter';
import { I18n } from './i18n';
export default class WordToMdPlugin extends Plugin {
    settings: WordToMdSettings;
    converter: WordConverter;
    i18n: I18n;
    onload(): Promise<void>;
    onunload(): Promise<void>;
    loadSettings(): Promise<void>;
    saveSettings(): Promise<void>;
}
//# sourceMappingURL=main.d.ts.map