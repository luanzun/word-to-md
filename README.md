# Word to MD Obsidian Plugin

A simple and powerful Obsidian plugin to convert Word documents (.docx, .doc) to Markdown format with proper formatting, images, and document properties.

## Project Badges

![GitHub release](https://img.shields.io/github/v/release/luanzun/word-to-md)
![License](https://img.shields.io/badge/license-MIT-blue)
![Platform](https://img.shields.io/badge/platform-Obsidian-blue)

## Documentation Links

**中文文档** | English Documentation
- [中文文档 (README)](README.zh.md) | [English Documentation (README)](README.md)
- [构建指南 (BUILD)](BUILD.zh.md) | [Build Guide (BUILD)](BUILD.md)

## Feature Checklist

- [x] Single File Conversion
- [x] Batch Conversion
- [x] Context Menu Integration
- [x] Command Palette Support
- [x] Heading Conversion (H1-H6)
- [x] Text Formatting (Bold, Italic, Underline, Strikethrough)
- [x] Ordered and Unordered Lists
- [x] Table Conversion
- [x] Hyperlink Preservation
- [x] Image Extraction and Storage
- [x] YAML Front Matter (Document Properties)
- [x] Automatic Tag Generation
- [x] Customizable Image Folder Naming
- [x] Progress Notifications
- [x] i18n Support (English, Chinese)
- [x] Pandoc Support
- [ ] Advanced Formatting Options (Planned)
- [ ] Custom CSS Styling (Planned)

## Features

### Core Features
- **Single File Conversion**: Convert individual Word documents to Markdown
- **Batch Conversion**: Convert all Word documents in a folder
- **Context Menu Integration**: Right-click on files/folders to convert
- **Command Palette Support**: Use Obsidian's command palette to trigger conversions

### Formatting Support
- **Headings**: Convert Word headings (H1-H6) to Markdown headings
- **Text Formatting**: Bold, italic, underline, strikethrough
- **Lists**: Ordered and unordered lists
- **Tables**: Convert Word tables to Markdown tables
- **Links**: Preserve hyperlinks
- **Images**: Extract images and save to dedicated folders

### Document Properties
- **YAML Front Matter**: Convert Word document properties to YAML front matter
- **Tags**: Automatically generate tags from document properties (keywords, author, category)

### Image Handling
- **Automatic Folder Creation**: Create dedicated folders for images based on document name
- **Configurable Naming**: Customize image folder and file naming patterns
- **Relative Paths**: Use relative paths for images to ensure portability

## Installation

1. Download the latest release from the [releases page](https://github.com/luanzun/word-to-md/releases)
2. Extract the zip file to your Obsidian plugins folder (`VaultFolder/.obsidian/plugins/`)
3. Enable the plugin in Obsidian settings

## Usage

### Single File Conversion
1. **Right-click Method**: Right-click on a `.docx` or `.doc` file in the file explorer → Select "Convert to Markdown"
2. **Command Palette**: Press `Ctrl+P` (or `Cmd+P` on Mac) → Search for "Convert Word document" → Select the file

### Batch Conversion
1. **Context Menu**: Right-click on a folder in the file explorer → Select "Convert all Word documents to Markdown"
2. **Command Palette**: Press `Ctrl+P` (or `Cmd+P` on Mac) → Search for "Convert all Word documents in folder"

## Configuration

Open Obsidian settings and navigate to the "Word to MD" section to configure the plugin:

### Output Settings
- **Output Folder**: Folder where converted Markdown files will be saved. Leave empty to save in the same folder as the original file.
- **Overwrite Existing**: Whether to overwrite existing Markdown files with the same name.

### Image Settings
- **Image Folder Name**: Pattern for naming image folders. Use `{documentName}` to include the document name, `{timestamp}` to include a timestamp.

### Document Properties
- **Include Properties**: Whether to include document properties in the YAML front matter.

### Performance
- **Show Progress**: Display progress notifications during conversion.

### Language
- **Language**: Select the language for the plugin. Choose "Auto" to use Obsidian's language setting.

### Conversion Engine
- **Converter Type**: Choose which converter to use:
  - **Mammoth.js**: Built-in JavaScript converter, faster and works offline
  - **Pandoc**: External converter with more accurate formatting (requires Pandoc installation)
- **Pandoc Path**: Path to the pandoc executable. Click "Auto-detect" to find it automatically, or leave empty to use from system PATH.

## Technical Details

### Conversion Engine
- **Mammoth.js**: Built-in JavaScript converter for converting Word documents to HTML. Lightweight and reliable.
- **Turndown**: Converts HTML to Markdown with proper formatting and table support.
- **Pandoc**: Optional external converter for more accurate document formatting. Requires Pandoc installation on the system.

### File Support
- **Word 2007+**: .docx files are fully supported
- **Old Word Format**: .doc files may require additional processing and may have limited functionality

### Image Formats
- Supported formats: JPEG, PNG, GIF, BMP, TIFF, SVG

## Troubleshooting

### Common Issues
1. **Conversion Fails**: Check if the Word document is corrupted or password-protected
2. **Images Not Displaying**: Ensure the image folder was created correctly and relative paths are used
3. **Large Files**: For very large files, conversion may take some time. Check progress notifications.

### Error Messages
- **"File already exists"**: Enable "Overwrite Existing" in settings or rename the output file
- **"Unsupported image type"**: The document contains an unsupported image format
- **"Pandoc path not configured"**: When using Pandoc converter, you must provide the path or ensure Pandoc is in system PATH
- **"Pandoc not found"**: Use the "Auto-detect" button in settings or install Pandoc from https://pandoc.org/

## Development

### Prerequisites
- Node.js and npm
- TypeScript
- Rollup

### Building the Plugin
1. Clone the repository
2. Install dependencies: `npm install`
3. Build the plugin: `npm run build`
4. The built plugin files will be in the root directory (main.js, manifest.json, etc.)

For detailed build instructions, see the [Build Guide](BUILD.md) | [构建指南](BUILD.zh.md)

### Development Mode
1. Run `npm run dev` to start the TypeScript compiler in watch mode
2. The plugin will automatically rebuild when source files change

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

MIT License - see the [LICENSE](LICENSE) file for details.

---

## 中文文档 (README.zh.md)
