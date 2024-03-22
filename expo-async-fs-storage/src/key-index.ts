import { ExpoFilesystem } from "./filesystem";
import { Mutex } from "async-mutex";
import { KeyIndex, keyIndexSchema, KeyValue } from "./schema";
import { randomUUID } from "expo-crypto";

const KEYS = ".keys";

export class KeyIndexManager {
    private readonly _fs: ExpoFilesystem;
    private readonly _mutex = new Mutex();
    private readonly _keyIndex: KeyIndex = {};

    constructor(fs: ExpoFilesystem) {
        this._fs = fs;
    }

    private async _get(): Promise<KeyIndex> {
        if (Object.keys(this._keyIndex).length === 0) {
            try {
                const strData = (await this._fs.read(KEYS)) ?? "{}";
                const res = await keyIndexSchema.parseAsync(
                    JSON.parse(strData),
                );
                for (const [key, val] of Object.entries(res)) {
                    this._keyIndex[key] = val;
                }
            } catch (_) {}
        }

        return this._keyIndex;
    }

    async with(
        callback: (keyIndex: KeyIndex) => Promise<"save" | "pass">,
    ): Promise<void> {
        return await this._mutex.runExclusive(async () => {
            const keyIndex = await this._get();
            const res = await callback(keyIndex);
            if (res === "save") {
                await this._fs.write(KEYS, JSON.stringify(keyIndex));
            }
        });
    }

    static createDefaultKeyValue(): KeyValue {
        return {
            filename: randomUUID(),
        };
    }
}

const _store: Record<string, KeyIndexManager> = {};

export const getKeyIndex = (fs: ExpoFilesystem) => {
    if (!_store[fs.rootPath]) {
        _store[fs.rootPath] = new KeyIndexManager(fs);
    }

    return _store[fs.rootPath];
};
