import {
    AsyncStorage,
    FileSystem,
    FileSystemIndex,
} from "@mikchan-utility/async-fs-storage-interface";

class AsyncFsStorage implements AsyncStorage {
    private readonly _fs: FileSystem;
    private readonly _fsIndex: FileSystemIndex;

    constructor(fs: FileSystem, fsIndex: FileSystemIndex) {
        this._fs = fs;
        this._fsIndex = fsIndex;
    }

    async getItem(key: string): Promise<string | null> {
        try {
            const meta = await this._fsIndex.get(key);
            if (!meta) return null;
            return await this._fs.read(meta.path);
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async setItem(
        key: string,
        value?: string | undefined | null,
    ): Promise<void> {
        if (!value) return;
        try {
            await this._fsIndex.edit(
                key,
                value,
                async ({ path, shouldWrite }) => {
                    if (shouldWrite) {
                        await this._fs.write(path, value);
                        return {
                            action: "set",
                            value,
                        };
                    }
                },
            );
        } catch (e) {
            console.error(e);
        }
    }

    async removeItem(key: string): Promise<void> {
        try {
            await this._fsIndex.edit(key, null, async ({ path }) => {
                await this._fs.remove(path);
                return { action: "remove" };
            });
        } catch (e) {
            console.error(e);
        }
    }

    async getAllKeys(): Promise<string[]> {
        try {
            return await this._fsIndex.getAllKeys();
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async clear(): Promise<void> {
        try {
            const keys = await this.getAllKeys();
            await Promise.all(keys.map(this.removeItem));
        } catch (e) {
            console.error(e);
        }
    }
}

export default AsyncFsStorage;
