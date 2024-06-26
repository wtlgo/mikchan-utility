import { FileSystem } from "@mikchan-utility/async-fs-storage-interface";
import * as FS from "expo-file-system";

export class ExpoFilesystem implements FileSystem {
    readonly rootPath: string;

    constructor(path: string) {
        this.rootPath = `${FS.documentDirectory}/${path}`.replaceAll(
            /\/+/g,
            "/",
        );
    }

    async read(path: string): Promise<string | null> {
        const filePath = `${this.rootPath}/${path}`;
        try {
            return await FS.readAsStringAsync(filePath);
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async write(path: string, value: string): Promise<void> {
        const filePath = `${this.rootPath}/${path}`;
        try {
            await FS.writeAsStringAsync(filePath, value);
        } catch (e) {
            console.error(e);
        }
    }

    async remove(path: string): Promise<void> {
        const filePath = `${this.rootPath}/${path}`;
        try {
            await FS.deleteAsync(filePath);
        } catch (e) {
            console.error(e);
        }
    }
}
