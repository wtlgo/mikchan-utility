import { AsyncStorage, FileSystem, FileSystemIndex } from "./interface";

export class AsyncFsStorage implements AsyncStorage {
    private readonly _fs: FileSystem;
    private readonly _fsIndex: FileSystemIndex;

    constructor(fs: FileSystem, fsIndex: FileSystemIndex) {
        this._fs = fs;
        this._fsIndex = fsIndex;
    }

    async getItem(key: string): Promise<string | null> {
        try {
            const { path } = await this._fsIndex.getMeta(key);
            return await this._fs.read(path);
        } catch (_) {
            return null;
        }
    }

    async setItem(
        key: string,
        value?: string | undefined | null,
    ): Promise<void> {
        if (!value) return;
        try {
            const { path, shouldWrite } = await this._fsIndex.getMeta(
                key,
                value,
            );

            if (shouldWrite) {
                await Promise.all([
                    this._fs.write(path, value),
                    this._fsIndex.saveMeta(key, value),
                ]);
            }
        } catch (_) {}
    }

    async removeItem(key: string): Promise<void> {
        try {
            const { path } = await this._fsIndex.getMeta(key);
            await Promise.all([
                this._fs.remove(path),
                this._fsIndex.removeMeta(key),
            ]);
        } catch (_) {}
    }

    async getAllKeys(): Promise<string[]> {
        try {
            return await this._fsIndex.getAllKeys();
        } catch (_) {
            return [];
        }
    }

    async clear(): Promise<void> {
        try {
            const keys = await this.getAllKeys();
            await Promise.all(keys.map(this.removeItem));
        } catch (_) {}
    }
}
