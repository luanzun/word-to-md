/*
 * @Author: fusemsg fuyun365@gmail.com
 * @Date: 2026-01-17 23:18:10
 * @LastEditors: fusemsg fuyun365@gmail.com
 * @LastEditTime: 2026-01-17 23:25:00
 * @FilePath: \\.eslintrc.js
 * @Description:  eslint配置文件
 */

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: [
    '@typescript-eslint',
    'obsidian'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/ban-types': 'warn',
    '@typescript-eslint/ban-ts-comment': 'warn',
    
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
    
    // Import/require rules
    '@typescript-eslint/no-var-requires': 'error',
    
    // Style rules
    'quotes': ['error', 'single', { avoidEscape: true }],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'no-trailing-spaces': 'error',
    'eol-last': 'error',
    'no-multiple-empty-lines': ['error', { max: 1 }]
  },
  env: {
    browser: true,
    es6: true,
    node: true
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.js',
    'main.js'
  ]
};