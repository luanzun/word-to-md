// eslint.config.mjs
import tsparser from "@typescript-eslint/parser";
import jsonParser from "jsonc-eslint-parser";
import { defineConfig } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";

export default defineConfig([
  // 1. 忽略不需要检查的文件
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.js',
      'main.js',
      '.codebuddy/**',
      'package-lock.json',
      'tsconfig.json',
      '.husky/**',
      '.trae/**',
      
    ]
  },
  // 2. 为配置文件自身设置环境
  {
    files: ["**/*.mjs"],
    languageOptions: {
      globals: {
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly"
      }
    }
  },
  // 3. Obsidian 推荐配置（这会应用到所有文件，包括 manifest.json）
  ...obsidianmd.configs.recommended,
  // 4. 为 manifest.json 指定 JSON 解析器，同时保留 Obsidian 规则
  {
    files: ["manifest.json"],
    languageOptions: {
      parser: jsonParser
    },
    // 重新应用一遍 obsidianmd 插件，确保规则生效
    plugins: {
      obsidianmd
    }
  },
  // 5. TypeScript 文件配置
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: process.cwd()
      },
      globals: {
        // Node.js 环境
        process: "readonly",
        Buffer: "readonly",
        // 浏览器环境（Obsidian 插件中可用）
        console: "readonly",
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        // Obsidian 特定全局变量（根据你的插件需求）
        require: "readonly",
        exports: "writable",
        module: "writable"
      }
    },
    rules: {
      // Disable unsafe type checking for now
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',

      // TypeScript specific rules
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-var-requires': 'error',

      // General JavaScript rules
      'no-console': 'off',
      'no-debugger': 'warn',
      'no-alert': 'warn',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-template': 'error',

      // Code quality rules
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'brace-style': ['error', '1tbs'],
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',

      // Async/await rules
      'require-await': 'error',
      'no-return-await': 'warn',

      // Style rules
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'never'],
      'no-trailing-spaces': 'error',
      'eol-last': 'error',
      'no-multiple-empty-lines': ['error', { max: 1 }],

      // Obsidian specific rules
      'obsidianmd/object-assign': 'off',
      'obsidianmd/ui/sentence-case': 'off',
      "obsidianmd/validate-manifest": "error",
      "obsidianmd/validate-license": "error"
    }
  }
]);

