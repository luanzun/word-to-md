import { Notice, TFile, TFolder, normalizePath, Modal, App } from 'obsidian';
import WordToMdPlugin from './main';
import mammoth from 'mammoth';
import AdmZip from 'adm-zip';
import { ImageProcessor } from './utils/imageProcessor';
import { FileHelper } from './utils/fileHelper';
import TurndownService from 'turndown';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import * as fs from 'fs';

const execAsync = promisify(exec);

interface DocumentProperties {
  title?: string;
  author?: string;
  created?: string;
  modified?: string;
  subject?: string;
  keywords?: string;
  pages?: number;
  words?: number;
  company?: string;
  category?: string;
}

interface MammothImage {
  read: () => Promise<ArrayBuffer>;
  contentType: string;
}

export class WordConverter {
  plugin: WordToMdPlugin;
  imageProcessor: ImageProcessor;
  fileHelper: FileHelper;

  constructor(plugin: WordToMdPlugin) {
    this.plugin = plugin;
    this.imageProcessor = new ImageProcessor(plugin);
    this.fileHelper = new FileHelper(plugin);
  }

  // Show file picker for single file conversion
  async showSingleFilePicker() {
    try {
      // Use Obsidian's requestFile API for better integration
      const file = await (window as unknown as { requestFile: (options: { extensions: string[]; title: string }) => Promise<File> }).requestFile({
        extensions: ['docx', 'doc'],
        title: 'Select Word Document'
      });

      if (file) {
        await this.convertSingleFile(file);
      }
    } catch (error) {
      console.error('Error in showSingleFilePicker:', error);
      new Notice(this.plugin.i18n.t('conversionFailed', { fileName: 'Unknown file', error: String(error) }));
    }
  }

  // Show folder picker for batch conversion
  showFolderPicker() {
    const folders = this.plugin.app.vault.getAllFolders();
    const i18n = this.plugin.i18n;

    // Create a custom modal for folder selection
    class FolderPickerModal extends Modal {
      constructor(app: App, private wordConverter: WordConverter) {
        super(app);
      }

      onOpen() {
        const { contentEl } = this;
        contentEl.addClass('word-to-md-modal');

        contentEl.createEl('h3', { text: i18n.t('selectFolderTitle') });

        // Create select element
        const select = contentEl.createEl('select');
        select.addClass('word-to-md-select');

        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = i18n.t('selectFolderTitle');
        select.appendChild(defaultOption);

        // Add all folders as options
        for (const folder of folders) {
          const option = document.createElement('option');
          option.value = folder.path;
          option.textContent = folder.path;
          select.appendChild(option);
        }

        // Create convert button
        const convertButton = contentEl.createEl('button', { text: i18n.t('convertButton') });
        convertButton.addClass('word-to-md-button-right');

        convertButton.addEventListener('click', () => {
          void (async () => {
            const selectedFolderPath = select.value;
            if (selectedFolderPath) {
              const selectedFolder = this.app.vault.getAbstractFileByPath(selectedFolderPath);
              if (selectedFolder && selectedFolder instanceof TFolder) {
                await this.wordConverter.convertFolder(selectedFolder);
                this.close();
              }
            }
          })();
        });

        // Create cancel button
        const cancelButton = contentEl.createEl('button', { text: i18n.t('cancelButton') });
        cancelButton.addClass('word-to-md-button-right-margin');

        cancelButton.addEventListener('click', () => {
          this.close();
        });
      }

      onClose() {
        const { contentEl } = this;
        contentEl.empty();
      }
    }

    // Open the modal
    const modal = new FolderPickerModal(this.plugin.app, this);
    modal.open();
  }

  // Convert a single Word file
  async convertSingleFile(file: unknown): Promise<boolean> {
    const i18n = this.plugin.i18n;

    // Check if file is a TFile or File object
    if (!(file instanceof TFile || file instanceof File)) {
      throw new Error('Invalid file type');
    }

    const originalFileName = file.name;

    try {
      if (this.plugin.settings.showProgress) {
        new Notice(i18n.t('startingConversion', { fileName: originalFileName }));
      }

      let buffer: ArrayBuffer;
      let fileName: string;
      let fileParentPath: string;

      if (file instanceof TFile) {
        // Handle internal Obsidian TFile
        buffer = await this.plugin.app.vault.readBinary(file);
        fileName = file.name;
        fileParentPath = file.parent ? file.parent.path : '';
      } else {
        // Handle external File
        buffer = await file.arrayBuffer();
        fileName = file.name;
        fileParentPath = '';
      }

      // Extract document name without extension
      const documentName = fileName.replace(/\.(docx|doc)$/, '');

      // Get output folder path
      const outputFolder = this.plugin.settings.outputFolder
        ? this.plugin.settings.outputFolder
        : fileParentPath;

      // Ensure output folder exists
      await this.fileHelper.ensureDirectoryExists(outputFolder);

      // Convert Word to Markdown
      const result = await this.convertBufferToMarkdown(buffer, documentName, outputFolder);

      // Generate output file path
      const outputFilePath = normalizePath(`${outputFolder}/${documentName}.md`);

      // Check if file already exists and handle accordingly
      if (!this.plugin.settings.overwriteExisting && await this.fileHelper.fileExists(outputFilePath)) {
        if (this.plugin.settings.showProgress) {
          new Notice(i18n.t('fileExists', { filePath: outputFilePath }));
        }
        return false;
      }

      // Write Markdown file
      await this.plugin.app.vault.adapter.write(outputFilePath, result);

      if (this.plugin.settings.showProgress) {
        new Notice(i18n.t('conversionComplete', { fileName: fileName }));
      }
      return true;
    } catch (error) {
      console.error('Error converting file:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      new Notice(i18n.t('conversionFailed', { fileName: originalFileName, error: errorMsg }));
      return false;
    }
  }

  // Convert all Word files in a folder
  async convertFolder(folder: TFolder) {
    const i18n = this.plugin.i18n;

    try {
      if (this.plugin.settings.showProgress) {
        new Notice(i18n.t('batchConversionStarted', { folderName: folder.name }));
      }

      // Get all Word files in the folder
      const wordFiles = this.fileHelper.getWordFilesInFolder(folder);

      if (wordFiles.length === 0) {
        new Notice(i18n.t('noWordFilesFound', { folderName: folder.name }));
        return;
      }

      // Convert each file
      let successCount = 0;
      let skipCount = 0;
      let errorCount = 0;
      const totalFiles = wordFiles.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = wordFiles[i];
        if (this.plugin.settings.showProgress) {
          new Notice(i18n.t('convertingFile', { current: i + 1, total: totalFiles, fileName: file.name }));
        }

        const result = await this.convertSingleFile(file);
        if (result) {
          successCount++;
        } else {
          // Check if file exists to determine if it was skipped or failed
          const documentName = file.name.replace(/\.(docx|doc)$/, '');
          const outputFolder = this.plugin.settings.outputFolder || folder.path;
          const outputFilePath = normalizePath(`${outputFolder}/${documentName}.md`);

          if (await this.fileHelper.fileExists(outputFilePath) && !this.plugin.settings.overwriteExisting) {
            skipCount++;
          } else {
            errorCount++;
          }
        }
      }

      if (this.plugin.settings.showProgress) {
        new Notice(i18n.t('batchConversionCompleted', {
          successCount: successCount,
          skipCount: skipCount,
          errorCount: errorCount,
          totalFiles: totalFiles,
          folderName: folder.name
        }));
      }
    } catch (error) {
      console.error('Error during batch conversion:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      new Notice(i18n.t('batchConversionError', { error: errorMsg }));
    }
  }

  // Convert Word buffer to Markdown
  private async convertBufferToMarkdown(buffer: ArrayBuffer, documentName: string, outputFolder: string): Promise<string> {
    try {
      // Check which converter to use
      if (this.plugin.settings.converterType === 'pandoc') {
        return await this.convertWithPandoc(buffer, documentName, outputFolder);
      } else {
        return await this.convertWithMammoth(buffer, documentName, outputFolder);
      }
    } catch (error) {
      console.error('Error converting buffer to Markdown:', error);
      console.error('Error details:', error instanceof Error ? error.stack : String(error));
      throw error;
    }
  }

  // Convert using Mammoth.js + Turndown
  private async convertWithMammoth(buffer: ArrayBuffer, documentName: string, outputFolder: string): Promise<string> {
    // Get document properties
    const properties = this.extractDocumentProperties(buffer);

    // Local image counter for this document conversion
    let imageCounter = 0;

    // Configure mammoth options
    const options = {
      // Add image conversion configuration
      convertImage: mammoth.images.imgElement((async (image: MammothImage) => {
        try {
          // Increment image counter
          imageCounter++;
          // Read the image buffer
          const imageBuffer = await image.read();

          // Save the image to the appropriate folder
          const imagePath = await this.imageProcessor.saveImage(
            imageBuffer,
            documentName,
            outputFolder,
            image.contentType,
            imageCounter
          );

          // console.debug('Word to MD: Image saved to', imagePath);

          // Return the image attributes as expected by mammoth
          return {
            src: imagePath,
            alt: `Image ${imageCounter}`
          };
        } catch (error) {
          console.error('Word to MD: Error processing image:', error);
          return {
            src: '#',
            alt: 'Error loading image'
          };
        }
      }).bind(this))
    } as unknown;

      // Convert to HTML first (mammoth doesn't have a convertToMarkdown method)
      const htmlResult = await mammoth.convertToHtml(
        { arrayBuffer: buffer },
        options as Record<string, unknown>
      );

    // Generate YAML front matter with document properties
    let frontMatter = '';
    if (this.plugin.settings.includeProperties && properties) {
      frontMatter = this.generateFrontMatter(properties);
    }

    // Initialize Turndown service for HTML to Markdown conversion
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      emDelimiter: '*'
    });

    // Use our custom table converter for better table handling
    turndownService.addRule('tables', {
      filter: 'table',
      replacement: (content, node) => {
        if (node instanceof HTMLElement) {
          let markdownTable = '\n';
          const rows = node.querySelectorAll('tr');

          rows.forEach((row, rowIndex) => {
            const cells = row.querySelectorAll('th, td');
            const cellContents = Array.from(cells).map(cell =>
              cell.textContent?.trim() || ''
            );

            markdownTable += `| ${cellContents.join(' | ')} |\n`;

            // Add separator row after header
            if (rowIndex === 0) {
              const separators = cellContents.map(() => '---');
              markdownTable += `| ${separators.join(' | ')} |\n`;
            }
          });

          return markdownTable;
        }
        return content;
      }
    });

    // Convert HTML to Markdown
    const markdownContent = turndownService.turndown(htmlResult.value);

    // Return Markdown content with front matter
    return frontMatter + markdownContent;
  }

  // Convert using Pandoc
  private async convertWithPandoc(buffer: ArrayBuffer, documentName: string, outputFolder: string): Promise<string> {
    const i18n = this.plugin.i18n;

    // Check if pandoc path is configured
    const pandocPath = this.plugin.settings.pandocPath || 'pandoc';
    if (!pandocPath) {
      throw new Error(i18n.t('pandocPathNotConfigured'));
    }

    // Create temporary file for the Word document
    // Use unique temp directory to avoid conflicts
    const uniqueTempDir = join(tmpdir(), `word-to-md-${Date.now()}`);
    const tempInputPath = join(uniqueTempDir, `${documentName}.docx`);
    const tempOutputPath = join(uniqueTempDir, `${documentName}.md`);

    try {
      // Create temporary directory
      fs.mkdirSync(uniqueTempDir, { recursive: true });

      // Extract raster images (PNG, JPG, etc.) before conversion
      const imageMap = await this.extractImagesFromDocx(buffer, documentName, outputFolder);
      //console.debug('Word to MD: Extracted images:', Object.keys(imageMap).length);

      // Write buffer to temporary file
      const nodeBuffer = Buffer.from(buffer);
      writeFileSync(tempInputPath, nodeBuffer);

      // Prepare pandoc command - convert to markdown with embedded images
      const mediaDir = join(uniqueTempDir, 'media');
      // Ensure media directory exists
      fs.mkdirSync(mediaDir, { recursive: true });
      const pandocCommand = `"${pandocPath}" "${tempInputPath}" -t markdown -o "${tempOutputPath}" --wrap=preserve --extract-media="${mediaDir}"`;

      //console.debug('Word to MD: Executing pandoc command:', pandocCommand);
      //console.debug('Word to MD: Temp directory:', uniqueTempDir);
      //console.debug('Word to MD: Temp media directory:', mediaDir);

      // Execute pandoc
      const { stderr } = await execAsync(pandocCommand, {
        timeout: 60000,
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });

      // stdout is not used but kept for debugging

      if (stderr && stderr.includes('Error')) {
        throw new Error(`Pandoc error: ${stderr}`);
      }

      // Read the converted markdown
      let markdownContent = await fs.promises.readFile(tempOutputPath, 'utf-8');

      // Check if pandoc extracted media files
      if (existsSync(join(uniqueTempDir, 'media'))) {
        const extractedMediaDir = join(uniqueTempDir, 'media');
        //console.debug('Word to MD: Pandoc extracted media to:', extractedMediaDir);
        // Copy extracted media files to the output folder and build map
        const pandocMediaMap = await this.copyMediaFiles(extractedMediaDir, documentName, outputFolder);

        // Update image references to point to saved images
        markdownContent = this.updateImageReferences(markdownContent, imageMap, pandocMediaMap);
      } else {
        //console.debug('Word to MD: No media directory found in temp dir');
        // No media extracted by pandoc, just use our extracted images
        if (Object.keys(imageMap).length > 0) {
          markdownContent = this.updateImageReferences(markdownContent, imageMap, {});
        }
      }

      // Add document properties if enabled
      if (this.plugin.settings.includeProperties) {
        const properties = this.extractDocumentProperties(buffer);
        const frontMatter = this.generateFrontMatter(properties);
        markdownContent = frontMatter + markdownContent;
      }

      return markdownContent;
    } finally {
      // Clean up temporary files
      try {
        if (existsSync(tempInputPath)) {
          unlinkSync(tempInputPath);
        }
        if (existsSync(tempOutputPath)) {
          unlinkSync(tempOutputPath);
        }
        // Clean up media directory (may be a subdirectory)
        const mediaDir1 = join(uniqueTempDir, 'media');
        const mediaDir2 = join(uniqueTempDir, 'media', 'media');
        for (const dirToClean of [mediaDir1, mediaDir2, join(uniqueTempDir, 'media')]) {
          if (existsSync(dirToClean)) {
            fs.rmSync(dirToClean, { recursive: true, force: true });
            //console.debug('Word to MD: Cleaned up media directory:', dirToClean);
          }
        }
        // Also try to clean up the base temp directory
        if (existsSync(uniqueTempDir) && uniqueTempDir !== tmpdir()) {
          fs.rmSync(uniqueTempDir, { recursive: true, force: true });
          //console.debug('Word to MD: Cleaned up temp directory:', uniqueTempDir);
        }
      } catch (error) {
        console.warn('Warning: Could not clean up temporary files:', error);
      }
    }
  }

  // Copy media files extracted by pandoc to output folder
  private async copyMediaFiles(mediaDir: string, documentName: string, outputFolder: string): Promise<Record<string, string>> {
    //console.debug('Word to MD: copyMediaFiles called with dir:', mediaDir);

    // Pandoc's --extract-media may create a 'media' subdirectory
    // Check if there's a 'media' subdirectory
    const mediaSubDir = join(mediaDir, 'media');
    let actualMediaDir = mediaDir;

    if (existsSync(mediaSubDir)) {
      //console.debug('Word to MD: Found media subdirectory, using:', mediaSubDir);
      actualMediaDir = mediaSubDir;
    }

    const mediaFiles = await fs.promises.readdir(actualMediaDir);
    //console.debug('Word to MD: Files in media directory:', mediaFiles);

    const mediaMap: Record<string, string> = {};

    for (const file of mediaFiles) {
      const srcPath = join(actualMediaDir, file);
      const ext = file.split('.').pop()?.toLowerCase();
      //console.debug('Word to MD: Processing media file:', file, 'ext:', ext);

      // Only copy image files
      if (ext && ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'emf', 'wmf'].includes(ext)) {
        // Determine image number from filename
        const match = file.match(/(\d+)/);
        const imageNum = match ? parseInt(match[1]) : 0;

        // Read the image file
        const imageBuffer = await fs.promises.readFile(srcPath);
        //console.debug('Word to MD: Read media file, size:', imageBuffer.length);

        // For EMF/WMF vector formats, save with original extension
        // These cannot be converted to PNG directly in Node.js
        // let finalExt = ext;
        let finalBuffer = imageBuffer;
        let contentType = this.getContentType(ext);

        if (ext === 'emf' || ext === 'wmf') {
          //console.debug('Word to MD: EMF/WMF file detected, keeping original format');
          // Save with original extension but correct MIME type
          // finalExt = ext;  // Keep as .emf or .wmf
          contentType = this.getContentType(ext);  // Use correct MIME type
          finalBuffer = imageBuffer;  // No conversion
        }

        let imagePath: string;

        if (ext === 'emf' || ext === 'wmf') {
          // For EMF/WMF files, save directly with original extension
          // Generate image folder name using plugin settings
          const imageFolderName = this.plugin.settings.imageFolderName
            .replace('{documentName}', documentName)
            .replace('{timestamp}', Date.now().toString());

          // Create image folder path
          const imageFolderPath = normalizePath(`${outputFolder}/${imageFolderName}`);

          // Ensure the image folder exists
          await this.plugin.app.vault.adapter.mkdir(imageFolderPath);

          // Generate image file name
          const imageFileName = `${documentName}_image_${imageNum}.${ext}`;

          // Create full image file path
          const imageFilePath = normalizePath(`${imageFolderPath}/${imageFileName}`);

          // Write image buffer to file
          await this.plugin.app.vault.adapter.writeBinary(imageFilePath, finalBuffer);

          // Return relative path for Markdown reference
          imagePath = `./${imageFolderName}/${imageFileName}`;
        } else {
          // For other image formats, use ImageProcessor
          imagePath = await this.imageProcessor.saveImage(
            finalBuffer,
            documentName,
            outputFolder,
            contentType,
            imageNum
          );
        }

        // Map media filename (with path prefix if needed) to saved path
        // The key should match what pandoc references in markdown (e.g., "image1.emf")
        const mapKey = file;
        mediaMap[mapKey] = imagePath;
        //console.debug('Word to MD: Copied media file:', file, '->', imagePath);
      } else {
        //console.debug('Word to MD: Skipping non-image file:', file);
      }
    }

    return mediaMap;
  }

  // Extract document properties from Word file
  private extractDocumentProperties(buffer: ArrayBuffer): DocumentProperties {
    try {
      // Convert ArrayBuffer to Buffer for AdmZip
      const nodeBuffer = Buffer.from(buffer);
      const zip = new AdmZip(nodeBuffer);
      const properties: DocumentProperties = {};

      // Extract core properties from docProps/core.xml
      const coreXml = zip.readAsText('docProps/core.xml');
      if (coreXml) {
        const coreProps = this.parseCoreProperties(coreXml);
        Object.assign(properties, coreProps);
      }

      // Extract app properties from docProps/app.xml
      const appXml = zip.readAsText('docProps/app.xml');
      if (appXml) {
        const appProps = this.parseAppProperties(appXml);
        Object.assign(properties, appProps);
      }

      // If no properties found, use defaults
      if (Object.keys(properties).length === 0) {
        properties.title = 'Document title';
        properties.author = 'Unknown author';
        properties.created = new Date().toISOString();
        properties.modified = new Date().toISOString();
      }

      return properties;
    } catch (error) {
      console.error('Error extracting document properties:', error);
      // Return default properties if extraction fails
      return {
        title: 'Document title',
        author: 'Unknown author',
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      };
    }
  }

  // Parse core properties from XML
  private parseCoreProperties(xml: string): DocumentProperties {
    const properties: DocumentProperties = {};

    // Extract title
    const titleMatch = xml.match(/<dc:title>(.*?)<\/dc:title>/s);
    if (titleMatch) {
      properties.title = this.extractTextFromXml(titleMatch[1]);
    }

    // Extract author
    const authorMatch = xml.match(/<dc:creator>(.*?)<\/dc:creator>/s);
    if (authorMatch) {
      properties.author = this.extractTextFromXml(authorMatch[1]);
    }

    // Extract created date
    const createdMatch = xml.match(/<dcterms:created.*?>(.*?)<\/dcterms:created>/s);
    if (createdMatch) {
      properties.created = this.extractTextFromXml(createdMatch[1]);
    }

    // Extract modified date
    const modifiedMatch = xml.match(/<dcterms:modified.*?>(.*?)<\/dcterms:modified>/s);
    if (modifiedMatch) {
      properties.modified = this.extractTextFromXml(modifiedMatch[1]);
    }

    // Extract subject
    const subjectMatch = xml.match(/<dc:subject>(.*?)<\/dc:subject>/s);
    if (subjectMatch) {
      properties.subject = this.extractTextFromXml(subjectMatch[1]);
    }

    // Extract keywords
    const keywordsMatch = xml.match(/<cp:keywords>(.*?)<\/cp:keywords>/s);
    if (keywordsMatch) {
      properties.keywords = this.extractTextFromXml(keywordsMatch[1]);
    }

    return properties;
  }

  // Parse app properties from XML
  private parseAppProperties(xml: string): DocumentProperties {
    const properties: DocumentProperties = {};

    // Extract total pages
    const pagesMatch = xml.match(/<Pages>(.*?)<\/Pages>/s);
    if (pagesMatch) {
      properties.pages = parseInt(this.extractTextFromXml(pagesMatch[1]));
    }

    // Extract total words
    const wordsMatch = xml.match(/<Words>(.*?)<\/Words>/s);
    if (wordsMatch) {
      properties.words = parseInt(this.extractTextFromXml(wordsMatch[1]));
    }

    // Extract company
    const companyMatch = xml.match(/<Company>(.*?)<\/Company>/s);
    if (companyMatch) {
      properties.company = this.extractTextFromXml(companyMatch[1]);
    }

    // Extract category
    const categoryMatch = xml.match(/<Category>(.*?)<\/Category>/s);
    if (categoryMatch) {
      properties.category = this.extractTextFromXml(categoryMatch[1]);
    }

    return properties;
  }

  // Extract text from XML, handling CDATA sections
  private extractTextFromXml(xml: string): string {
    // Remove CDATA tags if present
    const cdataMatch = xml.match(/<!\[CDATA\[(.*?)\]\]>/s);
    if (cdataMatch) {
      return cdataMatch[1].trim();
    }

    // Otherwise, just trim the text
    return xml.trim();
  }

  // Generate YAML front matter with document properties
  private generateFrontMatter(properties: DocumentProperties): string {
    let frontMatter = '---\n';
    const tags: string[] = [];

    // Add properties as YAML fields and collect tags
    for (const [key, value] of Object.entries(properties)) {
      if (value) {
        frontMatter += `${key}: ${value}\n`;

        // Convert keywords to tags
        if (key === 'keywords' && typeof value === 'string') {
          const keywords = value.split(/[,;]/).map((keyword: string) => keyword.trim());
          tags.push(...keywords);
        }

        // Convert author to tag
        if (key === 'author' && typeof value === 'string') {
          tags.push(`author:${value}`);
        }

        // Convert category to tag
        if (key === 'category' && typeof value === 'string') {
          tags.push(value);
        }

        // Convert company to tag
        if (key === 'company' && typeof value === 'string') {
          tags.push(`company:${value}`);
        }
      }
    }

    // Add tags to front matter if any
    if (tags.length > 0) {
      frontMatter += `tags: [${tags.map(tag => `"${tag}"`).join(', ')}]\n`;
    }

    frontMatter += '---\n\n';
    return frontMatter;
  }

  // Extract images from Word document
  private async extractImagesFromDocx(buffer: ArrayBuffer, documentName: string, outputFolder: string): Promise<Record<string, string>> {
    const imageMap: Record<string, string> = {};

    try {
      // Convert ArrayBuffer to Buffer for AdmZip
      const nodeBuffer = Buffer.from(buffer);
      const zip = new AdmZip(nodeBuffer);

      // Get all entries from the zip file
      const entries = zip.getEntries();

      //console.debug('Word to MD: All entries in docx:', entries.map(e => e.entryName).slice(0, 20));

      // Filter for raster image files (PNG, JPG, etc.) - skip EMF/WMF
      const imageEntries = entries.filter(entry => {
        const name = entry.entryName;
        return name.match(/(word\/media\/)?image\d+\.(png|jpg|jpeg|gif|bmp|svg)$/i);
      });

      //console.debug('Word to MD: Found raster images in document:', imageEntries.length);
      //console.debug('Word to MD: Image entries:', imageEntries.map(e => e.entryName));

      // Extract and save each image
      let imageCounter = 0;
      for (const entry of imageEntries) {
        try {
          imageCounter++;
          const imageBuffer = entry.getData();

          // Get file extension from entry name
          const match = entry.entryName.match(/\.(\w+)$/);
          const extension = match ? match[1].toLowerCase() : 'png';

          // Create MIME type
          const contentType = this.getContentType(extension);

          // Save image using ImageProcessor
          const imagePath = await this.imageProcessor.saveImage(
            imageBuffer,
            documentName,
            outputFolder,
            contentType,
            imageCounter
          );

          // Map original image reference (both formats) to saved path
          const shortName = entry.entryName.replace(/^(word\/media\/|media\/)/, '');
          imageMap[entry.entryName] = imagePath;
          imageMap[shortName] = imagePath;
          //console.debug('Word to MD: Extracted image:', entry.entryName, '->', imagePath);
        } catch (error) {
          console.error('Word to MD: Error extracting image:', entry.entryName, error);
        }
      }

      return imageMap;
    } catch (error) {
      console.error('Word to MD: Error extracting images:', error);
      return imageMap;
    }
  }

  // Get content type from file extension
  private getContentType(extension: string): string {
    const typeMap: Record<string, string> = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'svg': 'image/svg+xml',
      'emf': 'application/x-msmetafile',
      'wmf': 'application/x-msmetafile'
    };
    return typeMap[extension] || 'image/png';
  }

  // Update image references in markdown content
  private updateImageReferences(
    markdownContent: string,
    imageMap: Record<string, string>,
    pandocMediaMap: Record<string, string>
  ): string {
    //console.debug('Word to MD: Updating image references in markdown, length:', markdownContent.length);
    //console.debug('Word to MD: Image map keys:', Object.keys(imageMap));
    //console.debug('Word to MD: Pandoc media map keys:', Object.keys(pandocMediaMap));

    // Pandoc typically creates references like: ![alt](media/image1.png)
    // We need to update these to point to the saved images
    let updatedContent = markdownContent;

    // First, remove any HTML attributes from markdown image references
    // Pandoc may generate: ![alt](media/image1.png){width="6.5in" height="2.4in"}
    updatedContent = updatedContent.replace(/\{[^}]+\}/g, '');

    // Then process image references from our extraction
    for (const [originalPath, newPath] of Object.entries(imageMap)) {
      // Get the filename (without path prefix)
      const filename = originalPath.replace(/^(word\/media\/|media\/)/, '');
      const filenameNoExt = filename.replace(/\.\w+$/, '');

      // Create regex patterns for different formats pandoc might use
      // Pattern 1: ![alt](media/image1.png)
      // Pattern 2: ![alt](image1.png)
      // Pattern 3: <img src="media/image1.png">
      const patterns = [
        new RegExp(`!\\[([^\\]]*)\\]\\(media\\/${filenameNoExt}\\.(png|PNG|jpe?g|JPE?G|gif|GIF|bmp|BMP|svg|SVG)\\)`, 'g'),
        new RegExp(`!\\[([^\\]]*)\\]\\(${filenameNoExt}\\.(png|PNG|jpe?g|JPE?G|gif|GIF|bmp|BMP|svg|SVG)\\)`, 'g'),
        new RegExp(`<img[^>]+src=["']media\\/${filenameNoExt}\\.(png|PNG|jpe?g|JPE?G|gif|GIF|bmp|BMP|svg|SVG)["'][^>]*>`, 'gi'),
        new RegExp(`<img[^>]+src=["']${filenameNoExt}\\.(png|PNG|jpe?g|JPE?G|gif|GIF|bmp|BMP|svg|SVG)["'][^>]*>`, 'gi')
      ];

      // Try each pattern
      for (const pattern of patterns) {
        const matches = updatedContent.match(pattern);
        if (matches) {
          //console.debug(`Word to MD: Found ${matches.length} matches for pattern`, pattern);
          for (const match of matches) {
            // Extract alt text if it's markdown format
            const altMatch = match.match(/^!\[([^\]]*)\]/);
            const alt = altMatch ? altMatch[1] : 'Image';

            // Replace with new path
            const replacement = `![${alt}](${newPath})`;
            updatedContent = updatedContent.replace(match, replacement);
            //console.debug('Word to MD: Replaced:', match.substring(0, 50), '->', replacement);
          }
        }
      }
    }

    // Also update references to pandoc-extracted media files (EMF, etc.)
    for (const [mediaName, newPath] of Object.entries(pandocMediaMap)) {
      // Escape the dot in filename for regex
      const escapedMediaName = mediaName.replace(/\./g, '\\.');

      // Handle both relative paths and absolute paths that pandoc might generate
      const patterns = [
        // Match relative path: ![alt](media/image1.emf)
        new RegExp(`!\\[([^\\]]*)\\]\\(media\\/${escapedMediaName}\\)`, 'g'),
        // Match relative path without media prefix: ![alt](image1.emf)
        new RegExp(`!\\[([^\\]]*)\\]\\(${escapedMediaName}\\)`, 'g'),
        // Match absolute path (Windows): ![alt](C:\...\media\image1.emf)
        new RegExp(`!\\[([^\\]]*)\\]\\([A-Za-z]:[^)]*media[/\\\\]${escapedMediaName}\\)`, 'g'),
        // Match absolute path (Unix): ![alt](/tmp/.../media/image1.emf)
        new RegExp(`!\\[([^\\]]*)\\]\\([^)]*media[/\\\\]${escapedMediaName}\\)`, 'g')
      ];

      for (const pattern of patterns) {
        const matches = updatedContent.match(pattern);
        if (matches) {
          //console.debug(`Word to MD: Found ${matches.length} matches for pandoc media`, mediaName, 'pattern:', pattern);
          for (const match of matches) {
            const altMatch = match.match(/^!\[([^\]]*)\]/);
            const alt = altMatch ? altMatch[1] : 'Image';

            const replacement = `![${alt}](${newPath})`;
            updatedContent = updatedContent.replace(match, replacement);
          }
        }
      }
    }

    return updatedContent;
  }
}
