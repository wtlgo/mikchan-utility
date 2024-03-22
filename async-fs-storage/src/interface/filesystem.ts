export interface FileSystem {
    read(path: string): Promise<string | null>;
    write(path: string, value: string): Promise<void>;
    remove(path: string): Promise<void>;
}
