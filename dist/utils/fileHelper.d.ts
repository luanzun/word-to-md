import { TFile, TFolder } from 'obsidian';
import WordToMdPlugin from '../main';
export declare class FileHelper {
    plugin: WordToMdPlugin;
    constructor(plugin: WordToMdPlugin);
    fileExists(path: string): Promise<boolean>;
    ensureDirectoryExists(path: string): Promise<void>;
    getWordFilesInFolder(folder: TFolder): TFile[];
    generateUniqueFilePath(basePath: string, fileName: string): Promise<string>;
    normalizeFilePath(path: string): string;
    getFileNameWithoutExtension(fileName: string): string;
}
//# sourceMappingURL=fileHelper.d.ts.map