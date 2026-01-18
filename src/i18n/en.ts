import { Translation } from './types';

export const en: Translation = {
  // Plugin name
  pluginName: 'Word to Markdown',
  pluginDescription: 'Convert word documents to Markdown with proper formatting, images, and properties.',

  // Settings page
  // settingsTitle: 'Settings',

  // Output folder setting
  outputFolderName: 'Output folder name',
  outputFolderDesc: 'Folder where converted Markdown files will be saved. Leave empty to save in the same folder as the original file.',
  outputFolderPlaceholder: 'Enter folder path',

  // Image folder name setting
  imageFolderName: 'Image folder name',
  imageFolderDesc: 'Name of the folder where images will be saved. {documentName} will be replaced with the document name.',
  imageFolderPlaceholder: 'Enter folder name pattern',

  // Include properties setting
  includePropertiesName: 'Include document properties',
  includePropertiesDesc: 'Add word document properties as YAML front matter and tags.',

  // Overwrite existing files setting
  overwriteExistingName: 'Overwrite existing files',
  overwriteExistingDesc: 'Overwrite existing Markdown files with the same name.',

  // Show progress setting
  showProgressName: 'Show progress',
  showProgressDesc: 'Show progress notifications during conversion.',

  // Language setting
  languageName: 'Language',
  languageDesc: 'Select the language for the plugin. Choose "Auto" to use Obsidian\'s language setting.',

  // Commands
  convertSingleCommand: 'Convert word document',
  convertFolderCommand: 'Convert all word documents in folder',

  // Context menu items
  convertToMarkdown: 'Convert to Markdown',
  convertAllWordFiles: 'Convert all word files to Markdown',

  // Notifications
  startingConversion: 'Starting conversion of {fileName}...',
  conversionComplete: 'Successfully converted {fileName} to Markdown!',
  conversionFailed: 'Failed to convert {fileName}: {error}',
  fileExists: 'File {filePath} already exists. Skipping...',
  noWordFilesFound: 'No word files (.docx, .doc) found in {folderName}',
  batchConversionStarted: 'Starting batch conversion in {folderName}...',
  batchConversionCompleted: 'Batch conversion completed: {successCount} succeeded, {skipCount} skipped, {errorCount} failed out of {totalFiles} total files in {folderName}',
  convertingFile: 'Converting {current}/{total}: {fileName}',
  batchConversionError: 'Error during batch conversion: {error}',

  // Folder picker
  selectFolderTitle: 'Select folder to convert word documents',
  convertButton: 'Convert',
  cancelButton: 'Cancel',
  folderPickerNotImplemented: 'Folder picker not implemented yet; please use context menu on folder'
};
