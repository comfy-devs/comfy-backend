/* Types */
import { BuiltinRouteType } from "./built-in";
import { CustomRouteType } from "./custom";
import { MiracleFastifyRequest } from "util/fastify";
/* Node Imports */
import { z } from "zod";

export type RouteOptions = {
    path: string;
    type: BuiltinRouteType | CustomRouteType;
};

export const IDSchema = z.object({
    id: z.string().min(32).max(32)
});
export type IDSchemaType = z.infer<typeof IDSchema>;

export type RequestWithSchema<T> = MiracleFastifyRequest<{
    Body: T;
}>;
export type RequestWithSchemaQuery<T> = MiracleFastifyRequest<{
    Querystring: T;
}>;