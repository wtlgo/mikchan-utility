import {
    FileMeta,
    FileSystemIndex,
} from "@mikchan-utility/async-fs-storage-interface";
import { createKeyGenertor, KeyGenerator } from "./key-generator";
import { getKeyIndex, KeyIndexManager } from "./key-index";
import { ExpoFilesystem } from "./filesystem";
import { hash } from "./hash";
import { randomUUID } from "expo-crypto";

export class ExpoFileSystemIndex implements FileSystemIndex {
    private readonly _keyGenerator: KeyGenerator;
    private readonly _keyIndex: KeyIndexManager;

    constructor(fs: ExpoFilesystem, prefix?: string) {
        this._keyGenerator = createKeyGenertor(prefix);
        this._keyIndex = getKeyIndex(fs);
    }

    async get(
        key: string,
        value?: string | null | undefined,
    ): Promise<FileMeta | null> {
        const gkey = this._keyGenerator.generate(key);
        let res: FileMeta | null = null;

        await this._keyIndex.with(async (keyIndex) => {
            const val = keyIndex[gkey];

            if (val) {
                res = {
                    path: val.filename,
                    shouldWrite:
                        !value || !val.hash || val.hash !== (await hash(value)),
                };
            }

            return "pass";
        });

        return res;
    }

    async edit(
        key: string,
        value: string | null | undefined,
        callback: (
            meta: FileMeta,
        ) => Promise<
            void | { action: "set"; value: string } | { action: "remove" }
        >,
    ): Promise<void> {
        const gkey = this._keyGenerator.generate(key);
        await this._keyIndex.with(async (keyIndex) => {
            if (!keyIndex[gkey]) {
                keyIndex[gkey] = { filename: randomUUID() };
            }

            const meta = {
                path: keyIndex[gkey].filename,
                shouldWrite:
                    !value ||
                    !keyIndex[gkey].hash ||
                    keyIndex[gkey].hash !== (await hash(value)),
            };

            const res = await callback(meta);
            if (!res) {
                return "pass";
            }

            switch (res.action) {
                case "set": {
                    if (value) keyIndex[gkey].hash = await hash(value);
                    break;
                }

                case "remove": {
                    delete keyIndex[gkey];
                }
            }

            return "save";
        });
    }

    async getAllKeys(): Promise<string[]> {
        const keys: string[] = [];

        await this._keyIndex.with(async (keyIndex) => {
            keys.push(...this._keyGenerator.filter(Object.keys(keyIndex)));
            return "pass";
        });

        return keys;
    }
}
