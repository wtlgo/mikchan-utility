import { FileMeta, FileSystemIndex } from "@mikchan-utility/async-fs-storage";
import { createKeyGenertor, KeyGenerator } from "./key-generator";
import { getKeyIndex, KeyIndexManager } from "./key-index";
import { ExpoFilesystem } from "./filesystem";
import { hash } from "./hash";

export class ExpoFileSystemIndex implements FileSystemIndex {
    private readonly _keyGenerator: KeyGenerator;
    private readonly _keyIndex: KeyIndexManager;

    constructor(fs: ExpoFilesystem, prefix?: string) {
        this._keyGenerator = createKeyGenertor(prefix);
        this._keyIndex = getKeyIndex(fs);
    }

    async getMeta(
        key: string,
        value?: string | null | undefined,
    ): Promise<FileMeta> {
        const gkey = this._keyGenerator.generate(key);
        let keyIndex = await this._keyIndex.get();

        if (!(gkey in keyIndex)) {
            keyIndex = await this._keyIndex.edit(async (editKeyIndex) => {
                editKeyIndex[gkey] = KeyIndexManager.createDefaultKeyValue();
            });
        }

        const { filename, hash: hashValue } = keyIndex[gkey];

        let shouldWrite = true;
        if (value) {
            shouldWrite = !hashValue || hashValue !== (await hash(value));
        }

        return {
            path: filename,
            shouldWrite,
        };
    }

    async saveMeta(key: string, value: string): Promise<void> {
        const gkey = this._keyGenerator.generate(key);
        await this._keyIndex.edit(async (keyIndex) => {
            if (gkey in keyIndex) {
                keyIndex[gkey].hash = await hash(value);
            }
        });
    }

    async removeMeta(key: string): Promise<void> {
        const gkey = this._keyGenerator.generate(key);
        await this._keyIndex.edit(async (keyIndex) => {
            delete keyIndex[gkey];
        });
    }

    async getAllKeys(): Promise<string[]> {
        const keyIndex = await this._keyIndex.get();
        const keys = Object.keys(keyIndex);
        return this._keyGenerator.filter(keys);
    }
}
