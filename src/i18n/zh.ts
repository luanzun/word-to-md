import { Translation } from './types';

export const zh: Translation = {
  // Plugin name and description
  pluginName: 'Word转MD',
  pluginDescription: '将Word文档转换为Markdown，保留格式、图片和属性。',
  
  // Settings page
  settingsTitle: 'Word转MD 设置',
  
  // Output folder setting
  outputFolderName: '输出文件夹',
  outputFolderDesc: '转换后的Markdown文件将保存到的文件夹。留空则保存到原文件所在文件夹。',
  outputFolderPlaceholder: '输入文件夹路径',
  
  // Image folder name setting
  imageFolderName: '图片文件夹名称',
  imageFolderDesc: '保存图片的文件夹名称。{documentName}将被替换为文档名称。',
  imageFolderPlaceholder: '输入文件夹名称模板',
  
  // Include properties setting
  includePropertiesName: '包含文档属性',
  includePropertiesDesc: '将Word文档属性添加为YAML前置元数据和标签。',
  
  // Overwrite existing files setting
  overwriteExistingName: '覆盖现有文件',
  overwriteExistingDesc: '覆盖同名的现有Markdown文件。',
  
  // Show progress setting
  showProgressName: '显示进度',
  showProgressDesc: '转换过程中显示进度通知。',
  
  // Language setting
  languageName: '语言',
  languageDesc: '选择插件的语言。选择"Auto"使用Obsidian的语言设置。',
  
  // Commands
  convertSingleCommand: '转换单个Word文档',
  convertFolderCommand: '转换文件夹中的所有Word文档',
  
  // Context menu items
  convertToMarkdown: '转换为Markdown',
  convertAllWordFiles: '将所有Word文档转换为Markdown',
  
  // Notifications
  startingConversion: '开始转换 {fileName}...',
  conversionComplete: '成功将 {fileName} 转换为Markdown！',
  conversionFailed: '转换 {fileName} 失败：{error}',
  fileExists: '文件 {filePath} 已存在。跳过...',
  noWordFilesFound: '在 {folderName} 中未找到Word文件(.docx, .doc)',
  batchConversionStarted: '开始批量转换 {folderName} 中的文件...',
  batchConversionCompleted: '批量转换完成：{successCount} 成功，{skipCount} 跳过，{errorCount} 失败，共 {totalFiles} 个文件在 {folderName} 中',
  convertingFile: '正在转换 {current}/{total}：{fileName}',
  batchConversionError: '批量转换过程中出错：{error}',
  
  // Folder picker
  selectFolderTitle: '选择要转换Word文档的文件夹',
  convertButton: '转换',
  cancelButton: '取消',
  folderPickerNotImplemented: '文件夹选择器尚未实现，请使用文件夹上下文菜单'
};