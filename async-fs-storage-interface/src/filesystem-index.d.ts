import { FileMeta } from "./file-meta";

export interface FileSystemIndex {
    get(
        key: string,
        value?: string | undefined | null,
    ): Promise<FileMeta | null>;
    edit(
        key: string,
        value: string | undefined | null,
        callback: (
            meta: FileMeta,
        ) => Promise<
            { action: "set"; value: string } | { action: "remove" } | void
        >,
    ): Promise<void>;
    getAllKeys(): Promise<string[]>;
}
