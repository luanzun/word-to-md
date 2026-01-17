import { Translation } from './types';
export declare const supportedLanguages: {
    en: Translation;
    zh: Translation;
};
export type LanguageCode = keyof typeof supportedLanguages | 'auto';
export declare class I18n {
    private currentLanguage;
    private translations;
    constructor(languageCode: string);
    /**
     * Set the current language
     * @param languageCode The language code to set
     * @param app Optional Obsidian app instance for auto-detection
     */
    setLanguage(languageCode: string, app?: any): void;
    /**
     * Get the current language code
     * @returns The current language code
     */
    getCurrentLanguage(): LanguageCode;
    /**
     * Get a translation string
     * @param key The translation key
     * @param params Optional parameters to replace in the translation string
     * @returns The translated string
     */
    t(key: keyof Translation, params?: Record<string, string | number>): string;
}
//# sourceMappingURL=index.d.ts.map