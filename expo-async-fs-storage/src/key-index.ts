import { ExpoFilesystem } from "./filesystem";
import { Mutex } from "async-mutex";
import { KeyIndex, keyIndexSchema, KeyValue } from "./schema";
import { randomUUID } from "expo-crypto";

export class KeyIndexManager {
    private readonly _fs: ExpoFilesystem;
    private readonly _mutex = new Mutex();
    private _keyIndex: KeyIndex | undefined;

    constructor(fs: ExpoFilesystem) {
        this._fs = fs;
    }

    private async _get(): Promise<KeyIndex> {
        if (!this._keyIndex) {
            try {
                const strData = (await this._fs.read(".keys")) ?? "{}";
                this._keyIndex = await keyIndexSchema.parseAsync(
                    JSON.parse(strData),
                );
            } catch (_) {
                this._keyIndex = {};
            }
        }

        return this._keyIndex;
    }

    async get(): Promise<KeyIndex> {
        return await this._mutex.runExclusive(this._get);
    }

    async edit(
        callback: (keyIndex: KeyIndex) => Promise<void>,
    ): Promise<KeyIndex> {
        return await this._mutex.runExclusive(async () => {
            const keyIndex = await this._get();
            await callback(keyIndex);
            await this._fs.write(".keys", JSON.stringify(keyIndex));
            this._keyIndex = keyIndex;
            return this._keyIndex;
        });
    }

    static createDefaultKeyValue(): KeyValue {
        return {
            filename: randomUUID(),
        };
    }
}

class KeyIndexStore {
    private static _store: Record<string, KeyIndexManager> = {};

    public static get(fs: ExpoFilesystem) {
        if (!(fs.rootPath in this._store)) {
            this._store[fs.rootPath] = new KeyIndexManager(fs);
        }

        return this._store[fs.rootPath];
    }
}

export const getKeyIndex = (fs: ExpoFilesystem) => KeyIndexStore.get(fs);
