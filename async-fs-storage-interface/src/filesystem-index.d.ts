import { FileMeta } from "./file-meta";
export interface FileSystemIndex {
    getMeta(key: string, value?: string | undefined | null): Promise<FileMeta>;
    saveMeta(key: string, value: string): Promise<void>;
    removeMeta(key: string): Promise<void>;
    getAllKeys(): Promise<string[]>;
}
