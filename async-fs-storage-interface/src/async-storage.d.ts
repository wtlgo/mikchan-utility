export interface AsyncStorage {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value?: string | undefined): Promise<void>;
    removeItem(key: string): Promise<void>;
    getAllKeys(): Promise<string[]>;
    clear(): Promise<void>;
}
