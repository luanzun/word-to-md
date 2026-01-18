import { TFolder } from 'obsidian';
import WordToMdPlugin from './main';
import { ImageProcessor } from './utils/imageProcessor';
import { FileHelper } from './utils/fileHelper';
export declare class WordConverter {
    plugin: WordToMdPlugin;
    imageProcessor: ImageProcessor;
    fileHelper: FileHelper;
    constructor(plugin: WordToMdPlugin);
    showSingleFilePicker(): Promise<void>;
    showFolderPicker(): void;
    convertSingleFile(file: unknown): Promise<boolean>;
    convertFolder(folder: TFolder): Promise<void>;
    private convertBufferToMarkdown;
    private convertWithMammoth;
    private convertWithPandoc;
    private extractDocumentProperties;
    private parseCoreProperties;
    private parseAppProperties;
    private extractTextFromXml;
    private generateFrontMatter;
}
//# sourceMappingURL=converter.d.ts.map