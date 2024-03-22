import { z } from "zod";

export const keyValueSchema = z.object({
    filename: z.string(),
    hash: z.string().nullish(),
});
export type KeyValue = z.infer<typeof keyValueSchema>;

export const keyIndexSchema = z.record(z.string(), keyValueSchema);
export type KeyIndex = z.infer<typeof keyIndexSchema>;
