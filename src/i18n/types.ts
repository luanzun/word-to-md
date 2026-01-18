/*
 * @Author: fusemsg fuyun365@gmail.com
 * @Date: 2026-01-18 15:48:15
 * @LastEditors: fusemsg fuyun365@gmail.com
 * @LastEditTime: 2026-01-18 16:24:47
 * @FilePath: \word-to-md\src\i18n\types.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// Language types and interfaces

export interface Translation {
  // Plugin name and description
  pluginName: string;
  pluginDescription: string;

  // Output folder setting
  outputFolderName: string;
  outputFolderDesc: string;
  outputFolderPlaceholder: string;

  // Image folder name setting
  imageFolderName: string;
  imageFolderDesc: string;
  imageFolderPlaceholder: string;

  // Include properties setting
  includePropertiesName: string;
  includePropertiesDesc: string;

  // Overwrite existing files setting
  overwriteExistingName: string;
  overwriteExistingDesc: string;

  // Show progress setting
  showProgressName: string;
  showProgressDesc: string;

  // Language setting
  languageName: string;
  languageDesc: string;

  // Converter type setting
  converterTypeName: string;
  converterTypeDesc: string;
  converterTypeMammoth: string;
  converterTypePandoc: string;

  // Pandoc path setting
  pandocPathName: string;
  pandocPathDesc: string;
  pandocPathPlaceholder: string;
  autoDetectButton: string;
  detectingButton: string;
  pandocDetected: string;
  pandocNotFound: string;
  pandocDetectionFailed: string;
  pandocPathNotConfigured: string;

  // Commands
  convertSingleCommand: string;
  convertFolderCommand: string;

  // Context menu items
  convertToMarkdown: string;
  convertAllWordFiles: string;

  // Notifications
  startingConversion: string;
  conversionComplete: string;
  conversionFailed: string;
  fileExists: string;
  noWordFilesFound: string;
  batchConversionStarted: string;
  batchConversionCompleted: string;
  convertingFile: string;
  batchConversionError: string;

  // Folder picker
  selectFolderTitle: string;
  convertButton: string;
  cancelButton: string;
  folderPickerNotImplemented: string;
}
