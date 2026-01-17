import { TFile, TFolder, normalizePath } from 'obsidian';
import WordToMdPlugin from '../main';

export class FileHelper {
  plugin: WordToMdPlugin;

  constructor(plugin: WordToMdPlugin) {
    this.plugin = plugin;
  }

  // Check if a file exists
  async fileExists(path: string): Promise<boolean> {
    try {
      return await this.plugin.app.vault.adapter.exists(path);
    } catch (error) {
      console.error('Error checking if file exists:', error);
      return false;
    }
  }

  // Create directory if it doesn't exist
  async ensureDirectoryExists(path: string): Promise<void> {
    try {
      const exists = await this.plugin.app.vault.adapter.exists(path);
      if (!exists) {
        await this.plugin.app.vault.adapter.mkdir(path);
      }
    } catch (error) {
      console.error('Error ensuring directory exists:', error);
      throw error;
    }
  }

  // Get all Word files in a folder
  getWordFilesInFolder(folder: TFolder): TFile[] {
    return this.plugin.app.vault.getFiles().filter(file =>
      file.parent && file.parent.path === folder.path &&
      (file.extension === 'docx' || file.extension === 'doc')
    );
  }

  // Generate unique file path if file already exists
  async generateUniqueFilePath(basePath: string, fileName: string): Promise<string> {
    let filePath = normalizePath(`${basePath}/${fileName}`);
    let counter = 1;
    const extension = fileName.split('.').pop() || 'md';
    const nameWithoutExtension = fileName.slice(0, -extension.length - 1);

    while (await this.fileExists(filePath)) {
      filePath = normalizePath(`${basePath}/${nameWithoutExtension}_${counter}.${extension}`);
      counter++;
    }

    return filePath;
  }

  // Normalize file path for different operating systems
  normalizeFilePath(path: string): string {
    return normalizePath(path);
  }

  // Get file name without extension
  getFileNameWithoutExtension(fileName: string): string {
    return fileName.replace(/\.(docx|doc)$/, '');
  }
}
