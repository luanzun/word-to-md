# Word to MD Obsidian 插件

一个简单而强大的 Obsidian 插件，用于将 Word 文档（.docx, .doc）转换为 Markdown 格式，保留适当的格式、图片和文档属性。

## 项目徽章

![GitHub 发布](https://img.shields.io/github/v/release/luanzun/word-to-md)
![许可证](https://img.shields.io/badge/license-MIT-blue)
![平台](https://img.shields.io/badge/platform-Obsidian-blue)

## 文档链接

中文文档 | **English Documentation**
- [中文文档 (README)](README.zh.md) | [English Documentation (README)](README.md)
- [构建指南 (BUILD)](BUILD.zh.md) | [Build Guide (BUILD)](BUILD.md)

## 功能清单

- [x] 单文件转换
- [x] 批量转换
- [x] 上下文菜单集成
- [x] 命令面板支持
- [x] 标题转换（H1-H6）
- [x] 文本格式（粗体、斜体、下划线、删除线）
- [x] 有序和无序列表
- [x] 表格转换
- [x] 超链接保留
- [x] 图片提取和存储
- [x] YAML 前置元数据（文档属性）
- [x] 自动标签生成
- [x] 可自定义的图片文件夹命名
- [x] 进度通知
- [x] i18n 支持（英文、中文）
- [x] Pandoc 支持
- [ ] 高级格式选项（计划中）
- [ ] 自定义 CSS 样式（计划中）



## 功能特性

### 核心功能
- **单文件转换**：将单个 Word 文档转换为 Markdown
- **批量转换**：转换文件夹中的所有 Word 文档
- **上下文菜单集成**：右键点击文件/文件夹进行转换
- **命令面板支持**：使用 Obsidian 的命令面板触发转换

### 格式支持
- **标题**：将 Word 标题（H1-H6）转换为 Markdown 标题
- **文本格式**：粗体、斜体、下划线、删除线
- **列表**：有序列表和无序列表
- **表格**：将 Word 表格转换为 Markdown 表格
- **链接**：保留超链接
- **图片**：提取图片并保存到专用文件夹

### 文档属性
- **YAML 前置元数据**：将 Word 文档属性转换为 YAML 前置元数据
- **标签**：从文档属性（关键词、作者、类别）自动生成标签

### 图片处理
- **自动创建文件夹**：基于文档名称创建专用的图片文件夹
- **可配置命名**：自定义图片文件夹和文件命名模式
- **相对路径**：使用相对路径确保可移植性

## 安装

1. 从 [发布页面](https://github.com/luanzun/word-to-md/releases) 下载最新版本
2. 将 zip 文件解压到你的 Obsidian 插件文件夹（`VaultFolder/.obsidian/plugins/`）
3. 在 Obsidian 设置中启用插件

## 使用方法

### 单文件转换
1. **右键点击法**：在文件资源管理器中右键点击 `.docx` 或 `.doc` 文件 → 选择 "转换为 Markdown"
2. **命令面板**：按 `Ctrl+P`（或 Mac 上的 `Cmd+P`）→ 搜索 "转换 Word 文档" → 选择文件

### 批量转换
1. **上下文菜单**：在文件资源管理器中右键点击文件夹 → 选择 "将所有 Word 文档转换为 Markdown"
2. **命令面板**：按 `Ctrl+P`（或 Mac 上的 `Cmd+P`）→ 搜索 "转换文件夹中的所有 Word 文档"

## 配置

打开 Obsidian 设置，导航到 "Word to MD" 部分进行配置：

### 输出设置
- **输出文件夹**：转换后的 Markdown 文件将保存到的文件夹。留空则保存到原文件所在文件夹。
- **覆盖现有文件**：是否覆盖同名的现有 Markdown 文件。

### 图片设置
- **图片文件夹名称**：图片文件夹的命名模式。使用 `{documentName}` 包含文档名称，`{timestamp}` 包含时间戳。

### 文档属性
- **包含属性**：是否在 YAML 前置元数据中包含文档属性。

### 性能
- **显示进度**：转换过程中显示进度通知。

### 语言
- **语言**：选择插件的语言。选择"Auto"使用 Obsidian 的语言设置。

### 转换引擎
- **转换器类型**：选择使用的转换器：
  - **Mammoth.js**：内置的 JavaScript 转换器，速度更快且离线工作
  - **Pandoc**：外部转换器，格式更准确（需要安装 Pandoc）
- **Pandoc 路径**：Pandoc 可执行文件的路径。点击"自动检测"自动查找，或留空以使用系统 PATH。

## 技术细节

### 转换引擎
- **Mammoth.js**：内置的 JavaScript 转换器，用于将 Word 文档转换为 HTML。轻量级且可靠。
- **Turndown**：将 HTML 转换为 Markdown，支持适当的格式和表格。
- **Pandoc**：可选的外部转换器，用于更准确的文档格式化。需要在系统上安装 Pandoc。

### 文件支持
- **Word 2007+**：.docx 文件完全支持
- **旧版 Word 格式**：.doc 文件可能需要额外处理，功能可能受限

### 图片格式
- 支持的格式：JPEG、PNG、GIF、BMP、TIFF、SVG

## 故障排除

### 常见问题
1. **转换失败**：检查 Word 文档是否损坏或受密码保护
2. **图片不显示**：确保图片文件夹已正确创建并使用相对路径
3. **大文件**：对于非常大的文件，转换可能需要一些时间。请查看进度通知。

### 错误信息
- **"文件已存在"**：在设置中启用 "覆盖现有文件" 或重命名输出文件
- **"不支持的图片类型"**：文档包含不支持的图片格式
- **"未配置 Pandoc 路径"**：使用 Pandoc 转换器时，必须提供路径或确保 Pandoc 在系统 PATH 中
- **"未找到 Pandoc"**：使用设置中的"自动检测"按钮，或从 https://pandoc.org/ 安装 Pandoc

## 开发

### 先决条件
- Node.js 和 npm
- TypeScript
- Rollup

### 构建插件
1. 克隆仓库
2. 安装依赖：`npm install`
3. 构建插件：`npm run build`
4. 构建后的插件文件将位于根目录中（main.js、manifest.json 等）

详细的构建说明，请参阅 [构建指南](BUILD.zh.md) | [Build Guide](BUILD.md)

### 开发模式
1. 运行 `npm run dev` 启动 TypeScript 编译器的监视模式
2. 当源文件更改时，插件将自动重新构建

## 贡献

欢迎贡献！请随时提交问题、功能请求或拉取请求。

MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

---

## English Documentation (README.md)