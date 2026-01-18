import { Notice, TFile, TFolder, normalizePath, Modal, App } from 'obsidian';
import WordToMdPlugin from './main';
import * as mammoth from 'mammoth';
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

          console.debug('Word to MD: Image saved to', imagePath);

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
  private async convertWithPandoc(buffer: ArrayBuffer, documentName: string, _outputFolder: string): Promise<string> {
    const i18n = this.plugin.i18n;

    // Check if pandoc path is configured
    const pandocPath = this.plugin.settings.pandocPath || 'pandoc';
    if (!pandocPath) {
      throw new Error(i18n.t('pandocPathNotConfigured'));
    }

    // Create temporary file for the Word document
    const tempDir = tmpdir();
    const tempInputPath = join(tempDir, `${documentName}.docx`);
    const tempOutputPath = join(tempDir, `${documentName}.md`);

    try {
      // Write buffer to temporary file
      const nodeBuffer = Buffer.from(buffer);
      writeFileSync(tempInputPath, nodeBuffer);

      // Prepare pandoc command
      const pandocCommand = `"${pandocPath}" "${tempInputPath}" -t markdown -o "${tempOutputPath}" --wrap=preserve`;

      // Execute pandoc
      const { stdout, stderr } = await execAsync(pandocCommand, {
        timeout: 60000,
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });

      // stdout is not used but kept for debugging
      console.debug('Pandoc output:', stdout);

      if (stderr && stderr.includes('Error')) {
        throw new Error(`Pandoc error: ${stderr}`);
      }

      // Read the converted markdown
      let markdownContent = await fs.promises.readFile(tempOutputPath, 'utf-8');

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
      } catch (error) {
        console.warn('Warning: Could not clean up temporary files:', error);
      }
    }
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
        properties.title = 'Document Title';
        properties.author = 'Unknown Author';
        properties.created = new Date().toISOString();
        properties.modified = new Date().toISOString();
      }

      return properties;
    } catch (error) {
      console.error('Error extracting document properties:', error);
      // Return default properties if extraction fails
      return {
        title: 'Document Title',
        author: 'Unknown Author',
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
}
