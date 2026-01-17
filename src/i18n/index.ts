import { Translation } from './types';
import { en } from './en';
import { zh } from './zh';
import { getLanguage } from 'obsidian';

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
    this.currentLanguage = 'en';
    this.translations = en;
    
    // Try to set the language based on the provided code
    this.setLanguage(languageCode);
  }
  
  /**
   * Set the current language
   * @param languageCode The language code to set
   * @param app Optional Obsidian app instance for auto-detection
   */
  setLanguage(languageCode: string, app?: any): void {
    let detectedCode: string = languageCode.toLowerCase().split('-')[0];
    
    console.log('Word to MD: Attempting to set language:', detectedCode);
    
    // If auto-detection is requested, try to detect the language from Obsidian
    if (detectedCode === 'auto') {
      console.log('Word to MD: Auto-detecting language...');
      
      // Use Obsidian's getLanguage() function if available (Obsidian 1.8.7+)
      try {
        const obsidianLanguage = getLanguage();
        if (obsidianLanguage) {
          detectedCode = obsidianLanguage.toLowerCase().split('-')[0];
          console.log('Word to MD: Detected language from getLanguage():', detectedCode);
        }
      } catch (error) {
        console.log('Word to MD: getLanguage() not available, trying alternative methods...');
        
        // Fallback methods for older Obsidian versions
        if (app) {
          // Method 1: Check app language property
          if ((app as any).language) {
            detectedCode = (app as any).language.toLowerCase().split('-')[0];
            console.log('Word to MD: Detected language from app.language:', detectedCode);
          }
          // Method 2: Check for locale setting
          else if ((app as any).locale) {
            detectedCode = (app as any).locale.toLowerCase().split('-')[0];
            console.log('Word to MD: Detected language from app.locale:', detectedCode);
          }
          // Method 3: Check vault config
          else if ((app as any).vault && (app as any).vault.config) {
            detectedCode = ((app as any).vault.config.language || 'en').toLowerCase().split('-')[0];
            console.log('Word to MD: Detected language from app.vault.config.language:', detectedCode);
          }
          // Method 4: Check workspace language setting
          else if ((app as any).workspace && (app as any).workspace.language) {
            detectedCode = (app as any).workspace.language.toLowerCase().split('-')[0];
            console.log('Word to MD: Detected language from app.workspace.language:', detectedCode);
          }
        }
      }
      
      // If all methods fail, default to English
      if (detectedCode === 'auto') {
        detectedCode = 'en';
        console.log('Word to MD: Failed to detect language, defaulting to English');
      }
      
      console.log('Word to MD: Final auto-detected language:', detectedCode);
    }
    
    // Ensure detectedCode is a supported language, otherwise fallback to English
    const finalCode = detectedCode in supportedLanguages ? detectedCode : 'en';
    
    // Set the current language and translations
    this.currentLanguage = finalCode as LanguageCode;
    this.translations = supportedLanguages[finalCode as keyof typeof supportedLanguages];
    
    console.log('Word to MD: Language successfully set to:', this.currentLanguage);
    
    // Log the current translations for debugging
    console.log('Word to MD: Current translations:', this.translations);
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
      console.log(`Word to MD: Translation key '${key}' not found in ${this.currentLanguage}, falling back to English`);
      translation = en[key];
    }
    
    // Log the translation for debugging
    console.log(`Word to MD: Translating key '${key}' -> '${translation}' (language: ${this.currentLanguage})`);
    
    // Replace parameters in the translation string
    if (params) {
      for (const [param, value] of Object.entries(params)) {
        const regex = new RegExp(`\\{${param}\\}`, 'g');
        const oldTranslation = translation;
        translation = translation.replace(regex, String(value));
        console.log(`Word to MD: Replaced {${param}} with ${value} -> '${oldTranslation}' -> '${translation}'`);
      }
    }
    
    return translation;
  }
}