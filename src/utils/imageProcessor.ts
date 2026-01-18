import { normalizePath } from 'obsidian';
import WordToMdPlugin from '../main';

export class ImageProcessor {
  plugin: WordToMdPlugin;

  constructor(plugin: WordToMdPlugin) {
    this.plugin = plugin;
  }

  // Save image to the appropriate folder and return the relative path
  async saveImage(
    buffer: ArrayBuffer,
    documentName: string,
    outputFolder: string,
    contentType: string,
    imageIndex: number
  ): Promise<string> {
    try {
      // Determine image file extension from content type
      const extension = this.getImageExtension(contentType);
      if (!extension) {
        throw new Error(`Unsupported image type: ${contentType}`);
      }

      // Generate image file name using the provided index
      const imageFileName = `${documentName}_image_${imageIndex}.${extension}`;

      // Generate image folder name
      const imageFolderName = this.plugin.settings.imageFolderName
        .replace('{documentName}', documentName)
        .replace('{timestamp}', Date.now().toString());

      // Create image folder path
      const imageFolderPath = normalizePath(`${outputFolder}/${imageFolderName}`);

      // Ensure the image folder exists
      await this.plugin.app.vault.adapter.mkdir(imageFolderPath);

      // Create full image file path
      const imageFilePath = normalizePath(`${imageFolderPath}/${imageFileName}`);

      // Write image buffer to file
      await this.plugin.app.vault.adapter.writeBinary(imageFilePath, buffer);

      // Return relative path for Markdown reference
      return `./${imageFolderName}/${imageFileName}`;
    } catch (error) {
      console.error('Error saving image:', error);
      throw error;
    }
  }

  // Get file extension from content type
  private getImageExtension(contentType: string): string | null {
    const contentTypeMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/bmp': 'bmp',
      'image/tiff': 'tiff',
      'image/svg+xml': 'svg',
      'application/x-msmetafile': 'emf'
    };

    return contentTypeMap[contentType] || null;
  }
}
