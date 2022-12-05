import { z } from "zod";

export const IDZod = z.string().min(32).max(32);
export const IDSchema = z.object({
    id: IDZod
});
export type IDSchemaType = z.infer<typeof IDSchema>;