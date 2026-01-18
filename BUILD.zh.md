# Word to MD 插件构建指南

本指南将帮助您构建 Word to MD Obsidian 插件。

**[English Guide](BUILD.md)** | 中文文档

## 前置要求

- Node.js（推荐使用 LTS 版本）
- npm 或 yarn

## 安装步骤

1. **安装 Node.js**：从 [https://nodejs.org/](https://nodejs.org/) 下载并安装 Node.js
2. **打开终端**：导航到项目目录
3. **安装依赖**：运行 `npm install` 安装所有必需的依赖
4. **构建插件**：运行 `npm run build` 编译插件
5. **安装到 Obsidian**：将生成的 `main.js` 文件复制到您的 Obsidian 插件目录

## 可用脚本

- `npm run dev`：在开发模式下运行，启用文件监视
- `npm run build`：生产环境构建
- `npm run lint`：运行 ESLint 检查代码质量
- `npm run lint:fix`：运行 ESLint 并自动修复问题

## 项目结构

```
word-to-md/
├── src/
│   ├── utils/
│   │   ├── fileHelper.ts      # 文件操作工具
│   │   └── imageProcessor.ts  # 图片处理工具
│   ├── i18n/
│   │   ├── index.ts          # 国际化主类
│   │   ├── types.ts          # 翻译类型定义
│   │   ├── en.ts            # 英文翻译
│   │   └── zh.ts            # 中文翻译
│   ├── converter.ts           # 核心转换逻辑
│   ├── main.ts               # 插件入口
│   └── settings.ts           # 插件设置
├── main.js                   # 构建的插件文件
├── manifest.json             # 插件清单
├── package.json              # 项目依赖
├── eslint.config.mjs         # ESLint 配置 (ESLint 9)
├── rollup.config.js          # Rollup 配置
└── tsconfig.json             # TypeScript 配置
```

## 构建输出

构建过程将生成以下文件：
- `main.js`：编译后的插件代码

**注意**：当前配置未生成 source maps。如果需要 source maps 用于调试，请修改 `rollup.config.js` 来启用它们。

## ESLint 配置

本项目使用 ESLint 9 和新的扁平配置格式（`eslint.config.mjs`）。配置包括：

- **TypeScript 支持**：完整的 TypeScript 解析和类型检查
- **Obsidian ESLint 插件**：强制执行 Obsidian 插件最佳实践
- **自定义规则**：额外的代码质量和一致性规则

### ESLint 规则

配置包含来自以下插件的规则：
- `@typescript-eslint/eslint-plugin` - TypeScript 特定检查
- `eslint-plugin-obsidianmd` - Obsidian 插件开发标准

### 运行 ESLint

```bash
# 检查代码问题
npm run lint

# 自动修复问题
npm run lint:fix
```

## 故障排除

### 常见问题

1. **npm 命令未找到**：确保 Node.js 已正确安装并添加到您的 PATH 环境变量中
2. **构建错误**：检查控制台输出的具体错误信息，通常与缺少依赖或 TypeScript 错误有关
3. **插件无法在 Obsidian 中加载**：验证 `main.js` 和 `manifest.json` 文件是否正确放置在您的 Obsidian 插件目录中

### 推荐的 IDE

- **Visual Studio Code**：出色的 TypeScript 支持和 Obsidian 插件开发扩展
- **WebStorm**：强大的 JavaScript/TypeScript IDE，内置调试功能

## 手动构建步骤（替代方案）

如果自动构建过程遇到问题，可以尝试以下手动步骤：

1. 全局安装 TypeScript：`npm install -g typescript`
2. 全局安装 Rollup：`npm install -g rollup`
3. 运行 TypeScript 编译：`tsc`
4. 运行 Rollup 打包：`rollup -c`

## 贡献

为该项目做出贡献时，请遵循以下准则：

1. 所有代码使用 TypeScript
2. 遵循现有代码风格
3. 提交前运行 `npm run lint` 检查代码质量
4. 可能时运行 `npm run lint:fix` 自动修复检查问题
5. 提交前在 Obsidian 中测试您的更改
6. 遵循 Obsidian ESLint 插件最佳实践

## 许可证

MIT 许可证
