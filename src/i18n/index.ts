import { Translation } from './types';
import { en } from './en';
import { zh } from './zh';
import { getLanguage } from 'obsidian';

interface ObsidianApp {
  language?: string;
  locale?: string;
  vault?: {
    config?: {
      language?: string;
    };
  };
  workspace?: {
    language?: string;
  };
}

// Supported languages
export const supportedLanguages = {
  en,
  zh
};

export type LanguageCode = keyof typeof supportedLanguages | 'auto';

export class I18n {
  private currentLanguage: LanguageCode;
  private translations: Translation;

  constructor(languageCode: string) {
    // Set default language to English
    this.currentLanguage = 'en' as LanguageCode;
    this.translations = en;

    // Try to set the language based on the provided code
    this.setLanguage(languageCode);
  }

  /**
   * Set the current language
   * @param languageCode The language code to set
   * @param app Optional Obsidian app instance for auto-detection
   */
  setLanguage(languageCode: string, app?: ObsidianApp): void {
    let detectedCode: string = languageCode.toLowerCase().split('-')[0];

    console.debug('Word to MD: Attempting to set language:', detectedCode);

    // If auto-detection is requested, try to detect the language from Obsidian
    if (detectedCode === 'auto') {
      console.debug('Word to MD: Auto-detecting language...');

      // Use Obsidian's getLanguage() function if available (Obsidian 1.8.7+)
      try {
        const obsidianLanguage = getLanguage();
        if (obsidianLanguage) {
          detectedCode = obsidianLanguage.toLowerCase().split('-')[0];
          console.debug('Word to MD: Detected language from getLanguage():', detectedCode);
        }
      } catch {
        console.debug('Word to MD: getLanguage() not available, trying alternative methods...');

        // Fallback methods for older Obsidian versions
        if (app) {
          // Method 1: Check app language property
          if (this.hasProperty(app, 'language')) {
            detectedCode = String(this.getProperty(app, 'language')).toLowerCase().split('-')[0];
            console.debug('Word to MD: Detected language from app.language:', detectedCode);
          } else if (this.hasProperty(app, 'locale')) {
            // Method 2: Check for locale setting
            detectedCode = String(this.getProperty(app, 'locale')).toLowerCase().split('-')[0];
            console.debug('Word to MD: Detected language from app.locale:', detectedCode);
          } else if (this.hasProperty(app, 'vault') && this.hasProperty(this.getProperty(app, 'vault'), 'config')) {
            // Method 3: Check vault config
            const vault = this.getProperty(app, 'vault') as ObsidianApp['vault'];
            const languageProp = this.getProperty(vault?.config, 'language');
            const languageValue = typeof languageProp === 'string' ? languageProp : 'en';
            detectedCode = String(languageValue).toLowerCase().split('-')[0];
            console.debug('Word to MD: Detected language from app.vault.config.language:', detectedCode);
          } else if (this.hasProperty(app, 'workspace') && this.hasProperty(this.getProperty(app, 'workspace'), 'language')) {
            // Method 4: Check workspace language setting
            const workspace = this.getProperty(app, 'workspace') as ObsidianApp['workspace'];
            detectedCode = String(this.getProperty(workspace, 'language')).toLowerCase().split('-')[0];
            console.debug('Word to MD: Detected language from app.workspace.language:', detectedCode);
          }
        }
      }

      // If all methods fail, default to English
      if (detectedCode === 'auto') {
        detectedCode = 'en';
        console.debug('Word to MD: Failed to detect language, defaulting to English');
      }

      console.debug('Word to MD: Final auto-detected language:', detectedCode);
    }

    // Ensure detectedCode is a supported language, otherwise fallback to English
    const finalCode = detectedCode in supportedLanguages ? detectedCode : 'en';

    // Set the current language and translations
    this.currentLanguage = finalCode as LanguageCode;
    this.translations = supportedLanguages[finalCode as keyof typeof supportedLanguages];

    console.debug('Word to MD: Language successfully set to:', this.currentLanguage);

    // Log the current translations for debugging
    console.debug('Word to MD: Current translations:', this.translations);
  }

  /**
   * Get the current language code
   * @returns The current language code
   */
  getCurrentLanguage(): LanguageCode {
    return this.currentLanguage;
  }

  /**
   * Get a translation string
   * @param key The translation key
   * @param params Optional parameters to replace in the translation string
   * @returns The translated string
   */
  t(key: keyof Translation, params?: Record<string, string | number>): string {
    let translation = this.translations[key];

    // Fallback to English if the key is not found in the current language
    if (!translation) {
      console.debug(`Word to MD: Translation key '${key}' not found in ${this.currentLanguage}, falling back to English`);
      translation = en[key];
    }

    // Log the translation for debugging
    console.debug(`Word to MD: Translating key '${key}' -> '${translation}' (language: ${this.currentLanguage})`);

    // Replace parameters in the translation string
    if (params) {
      for (const [param, value] of Object.entries(params)) {
        const regex = new RegExp(`\\{${param}\\}`, 'g');
        const oldTranslation = translation;
        translation = translation.replace(regex, String(value));
        console.debug(`Word to MD: Replaced {${param}} with ${value} -> '${oldTranslation}' -> '${translation}'`);
      }
    }

    return translation;
  }

  /**
   * Safely check if an object has a property
   * @param obj The object to check
   * @param prop The property name
   * @returns True if the object has the property
   */
  private hasProperty(obj: unknown, prop: string): boolean {
    return obj !== null && obj !== undefined && typeof obj === 'object' && prop in obj;
  }

  /**
   * Safely get a property from an object
   * @param obj The object to get the property from
   * @param prop The property name
   * @returns The property value or undefined
   */
  private getProperty(obj: unknown, prop: string): unknown {
    return this.hasProperty(obj, prop) ? (obj as Record<string, unknown>)[prop] : undefined;
  }
}
