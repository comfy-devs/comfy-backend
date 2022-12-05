import { z } from "zod";
import { IDSchema } from "../types";

export const AuthCreateSchema = z.object({
    username: z.string().min(3).max(64),
    password: z.string().min(8).max(64)
});
export type AuthCreateSchemaType = z.infer<typeof AuthCreateSchema>;

export const DeleteSchema = IDSchema;
export type DeleteSchemaType = z.infer<typeof DeleteSchema>;

export const FetchMultipleSchema = z.object({
    id: z.string().min(32).max(32).optional(),
    start: z.number().nonnegative().optional(),
    end: z.number().nonnegative().optional()
});
export type FetchMultipleSchemaType = z.infer<typeof FetchMultipleSchema>;

export const FetchStructuredArraySchema = z.object({
    id: z.string().min(32).max(32).optional()
});
export type FetchStructuredArraySchemaType = z.infer<typeof FetchStructuredArraySchema>;

export const FetchSchema = IDSchema;
export type FetchSchemaType = z.infer<typeof FetchSchema>;

export const PushSendSchema = z.object({
    message: z.string(),
    adminKey: z.string()
});
export type PushSendSchemaType = z.infer<typeof PushSendSchema>;

export const PushSubscribeSchema = z.object({
    url: z.string(),
    key: z.string(),
    auth: z.string()
});
export type PushSubscribeSchemaType = z.infer<typeof PushSubscribeSchema>;

export const SessionCreateSchema = z.object({
    type: z.enum(["token", "classic"]),
    username: z.string().min(3).max(64).optional(),
    password: z.string().min(8).max(64).optional()
});
export type SessionCreateSchemaType = z.infer<typeof SessionCreateSchema>;

