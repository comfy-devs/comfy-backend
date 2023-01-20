import { z } from "zod";

export const ComfyJobsSchema = z.object({
    adminKey: z.string().min(3).max(64),
    server: z.string().min(3).max(64),
    jobs: z.array(z.any())
});
export type ComfyJobsSchemaType = z.infer<typeof ComfyJobsSchema>;