import WordToMdPlugin from '../main';
export declare class ImageProcessor {
    plugin: WordToMdPlugin;
    constructor(plugin: WordToMdPlugin);
    saveImage(buffer: ArrayBuffer, documentName: string, outputFolder: string, contentType: string, imageIndex: number): Promise<string>;
    private getImageExtension;
}
//# sourceMappingURL=imageProcessor.d.ts.map