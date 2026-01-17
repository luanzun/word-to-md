// Language types and interfaces

export interface Translation {
  // Plugin name and description
  pluginName: string;
  pluginDescription: string;
  
  // Settings page
  settingsTitle: string;
  
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