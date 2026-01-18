# Word to MD Plugin Build Guide

This guide will help you build the Word to MD plugin for Obsidian.

**[中文指南](BUILD.zh.md)** | English Documentation

## Prerequisites

- Node.js (LTS version recommended)
- npm or yarn

## Installation Steps

1. **Install Node.js**: Download and install Node.js from [https://nodejs.org/](https://nodejs.org/)
2. **Open Terminal**: Navigate to the project directory
3. **Install Dependencies**: Run `npm install` to install all required dependencies
4. **Build Plugin**: Run `npm run build` to compile the plugin
5. **Install in Obsidian**: Copy the generated `main.js` file to your Obsidian plugins directory

## Available Scripts

- `npm run dev`: Run in development mode with file watching
- `npm run build`: Build for production
- `npm run lint`: Run ESLint to check code quality
- `npm run lint:fix`: Run ESLint and automatically fix issues

## Project Structure

```
word-to-md/
├── src/
│   ├── utils/
│   │   ├── fileHelper.ts      # File operation utilities
│   │   └── imageProcessor.ts  # Image handling utilities
│   ├── i18n/
│   │   ├── index.ts          # Internationalization main class
│   │   ├── types.ts          # Translation type definitions
│   │   ├── en.ts            # English translations
│   │   └── zh.ts            # Chinese translations
│   ├── converter.ts           # Core conversion logic
│   ├── main.ts               # Plugin entry point
│   └── settings.ts           # Plugin settings
├── main.js                   # Built plugin file
├── manifest.json             # Plugin manifest
├── package.json              # Project dependencies
├── eslint.config.mjs         # ESLint configuration (ESLint 9)
├── rollup.config.js          # Rollup configuration
└── tsconfig.json             # TypeScript configuration
```

## Build Output

The build process will generate the following files:
- `main.js`: The compiled plugin code

**Note**: Source maps are not generated in the current configuration. If you need source maps for debugging, modify `rollup.config.js` to enable them.

## ESLint Configuration

This project uses ESLint 9 with the new flat config format (`eslint.config.mjs`). The configuration includes:

- **TypeScript Support**: Full TypeScript parsing and type checking
- **Obsidian ESLint Plugin**: Enforces Obsidian plugin best practices
- **Custom Rules**: Additional rules for code quality and consistency

### ESLint Rules

The configuration includes rules from:
- `@typescript-eslint/eslint-plugin` - TypeScript-specific linting
- `eslint-plugin-obsidianmd` - Obsidian plugin development standards

### Running ESLint

```bash
# Check code for issues
npm run lint

# Automatically fix issues
npm run lint:fix
```

## Troubleshooting

### Common Issues

1. **npm command not found**: Ensure Node.js is properly installed and added to your PATH
2. **Build errors**: Check the console output for specific error messages, typically related to missing dependencies or TypeScript errors
3. **Plugin not loading in Obsidian**: Verify that the `main.js` and `manifest.json` files are correctly placed in your Obsidian plugins directory
4. **ESLint errors about undefined variables**: Recent fixes ensure proper temporary directory creation for Pandoc conversions
5. **Image format errors**: The plugin now fully supports EMF and WMF vector image formats from Word documents

### Recommended IDEs

- **Visual Studio Code**: Excellent TypeScript support and Obsidian plugin development extensions
- **WebStorm**: Powerful JavaScript/TypeScript IDE with built-in debugging

## Manual Build Steps (Alternative)

If you encounter issues with the automated build process, you can try the following manual steps:

1. Install TypeScript globally: `npm install -g typescript`
2. Install Rollup globally: `npm install -g rollup`
3. Run TypeScript compilation: `tsc`
4. Run Rollup bundling: `rollup -c`

## Contributing

When contributing to this project, please follow these guidelines:

1. Use TypeScript for all code
2. Follow the existing code style
3. Run `npm run lint` to check code quality before committing
4. Run `npm run lint:fix` to automatically fix linting issues when possible
5. Test your changes in Obsidian before submitting
6. Follow Obsidian ESLint plugin best practices

## License

MIT License
