# Word to MD Plugin - Manual Installation Guide

由于npm和构建工具无法在当前环境中运行，您需要手动将插件安装到Obsidian中。以下是详细的安装步骤：

## 安装步骤

### 1. 创建插件文件夹
1. 打开您的Obsidian Vault文件夹
2. 进入 `.obsidian/plugins/` 目录
3. 创建一个新文件夹，命名为 `word-to-md`

### 2. 复制插件文件
将以下文件复制到刚刚创建的 `word-to-md` 文件夹中：
- `manifest.json`（已创建）
- `main.js`（已创建）

### 3. 重启Obsidian
1. 关闭Obsidian
2. 重新打开Obsidian

### 4. 启用插件
1. 打开Obsidian设置
2. 点击"社区插件"
3. 找到"Word to MD"插件
4. 点击开关启用插件

## 验证安装

插件安装完成后，您应该能够：
1. 在命令面板中搜索到"Convert Word document"命令
2. 在命令面板中搜索到"Convert all Word documents in folder"命令
3. 右键点击Word文件时看到"Convert to Markdown"选项
4. 右键点击文件夹时看到"Convert all Word documents to Markdown"选项
5. 在设置中找到"Word to MD"设置选项

## 插件文件说明

### manifest.json
包含插件的基本信息，如名称、版本、描述等。

### main.js
包含插件的所有功能代码，包括：
- 单文件转换功能
- 批量转换功能
- 图片处理功能
- 文档属性转换功能
- 配置选项

## 使用方法

### 单个文件转换
1. 在Obsidian文件浏览器中找到要转换的Word文档（.docx或.doc）
2. 右键点击文件
3. 选择"Convert to Markdown"

### 批量转换
1. 在Obsidian文件浏览器中找到要转换的文件夹
2. 右键点击文件夹
3. 选择"Convert all Word documents to Markdown"

### 配置插件
1. 打开Obsidian设置
2. 找到"Word to MD"插件
3. 配置以下选项：
   - 输出文件夹
   - 图片文件夹命名规则
   - 文档属性处理选项
   - 覆盖现有文件选项
   - 进度提示选项

## 注意事项

1. 由于这是一个简化版的插件，某些高级功能可能不可用
2. 插件使用了mammoth.js的简化实现，实际转换效果可能有限
3. 对于复杂的Word文档，建议使用完整版本的插件
4. 如果遇到问题，可以在Obsidian开发者控制台（按Ctrl+Shift+I打开）查看错误信息

## 更新插件

当需要更新插件时，只需：
1. 替换 `main.js` 和 `manifest.json` 文件
2. 重启Obsidian

## 卸载插件

1. 关闭Obsidian
2. 删除 `.obsidian/plugins/word-to-md` 文件夹
3. 重新打开Obsidian

## 常见问题

### 插件不显示在Obsidian中
- 检查插件文件夹名称是否为 `word-to-md`
- 检查是否包含 `main.js` 和 `manifest.json` 文件
- 重启Obsidian

### 转换失败
- 检查Word文档是否损坏或密码保护
- 检查Word文档格式是否为 `.docx`
- 查看Obsidian控制台日志

### 图片不显示
- 检查图片文件夹是否创建成功
- 检查Markdown文件中的图片路径是否正确

## 完整版本构建

如果您想构建完整版本的插件，需要：
1. 安装Node.js和npm
2. 克隆插件仓库
3. 运行 `npm install` 安装依赖
4. 运行 `npm run build` 构建插件
5. 将生成的文件复制到Obsidian插件文件夹

## 支持

如果您在使用过程中遇到问题，可以：
1. 查看插件的README.md文件
2. 检查Obsidian社区论坛
3. 在GitHub上提交问题（如果插件已发布）

祝您使用愉快！