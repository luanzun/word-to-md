import { Translation } from './types';
import { App } from 'obsidian';
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
    setLanguage(languageCode: string, app?: App): void;
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
    /**
     * Safely check if an object has a property
     * @param obj The object to check
     * @param prop The property name
     * @returns True if the object has the property
     */
    private hasProperty;
    /**
     * Safely get a property from an object
     * @param obj The object to get the property from
     * @param prop The property name
     * @returns The property value or undefined
     */
    private getProperty;
}
//# sourceMappingURL=index.d.ts.map