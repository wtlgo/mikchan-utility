export interface HashProvider {
    hash(value: string): Promise<string>;
}
