export interface KeyGenerator {
    generate(key: string): string;
    filter(keys: string[]): string[];
}

class PrefixKeyGenerator implements KeyGenerator {
    private readonly _prefix: string;

    constructor(prefix: string) {
        this._prefix = prefix;
    }

    filter(keys: string[]): string[] {
        const pref = `${this._prefix}.`;
        return keys
            .filter((key) => key.startsWith(pref))
            .map((key) => key.slice(pref.length));
    }

    generate(key: string): string {
        return `${this._prefix}.${key}`;
    }
}

class NoPrefixKeyGenerator implements KeyGenerator {
    filter(keys: string[]): string[] {
        return keys
            .filter((key) => key.startsWith("."))
            .map((key) => key.slice(1));
    }

    generate(key: string): string {
        return `.${key}`;
    }
}

export const createKeyGenertor = (prefix?: string) =>
    prefix ? new PrefixKeyGenerator(prefix) : new NoPrefixKeyGenerator();
