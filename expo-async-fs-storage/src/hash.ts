import { digestStringAsync, CryptoDigestAlgorithm } from "expo-crypto";

export const hash = (value: string) =>
    digestStringAsync(CryptoDigestAlgorithm.SHA256, value);
