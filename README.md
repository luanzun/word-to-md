# Word to MD Obsidian Plugin

A simple and powerful Obsidian plugin to convert Word documents (.docx, .doc) to Markdown format with proper formatting, images, and document properties.

**[中文文档](README.zh.md)** | English Documentation

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

## Technical Details

### Conversion Engine
- **Mammoth.js**: Used for converting Word documents to HTML. A lightweight and reliable library.
- **Turndown**: Used for converting HTML to Markdown with proper formatting and table support.
- **Pandoc Support**: (Planned) Optional support for Pandoc for more complex document conversions.

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

### Development Mode
1. Run `npm run dev` to start the TypeScript compiler in watch mode
2. The plugin will automatically rebuild when source files change

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## License

MIT License - see the [LICENSE](LICENSE) file for details.
