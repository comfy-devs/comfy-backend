/* Types */
import { Session } from "ts/backend/base";
import { MiracleFastifyReply, MiracleFastifyRequest } from "util/fastify";
/* Node Imports */
import { z } from "zod";
/* Local Imports */
import Database from "database";
import { RouteGenericInterface } from "fastify/types/route";

export function validateSchema(schema: z.Schema, data: any, rep: MiracleFastifyReply): boolean {
    const result = schema.safeParse(data);
    if(!result.success) {
        rep.code(400);
        rep.send({ error: result.error.message });
        return false;
    }

    return true;
}
export function validateSchemaBody(schema: z.Schema, req: MiracleFastifyRequest<RouteGenericInterface>, rep: MiracleFastifyReply): boolean {
    return validateSchema(schema, req.body, rep);
}
export function validateSchemaQuery(schema: z.Schema, req: MiracleFastifyRequest<RouteGenericInterface>, rep: MiracleFastifyReply): boolean {
    return validateSchema(schema, req.query, rep);
}

export async function getSession(database: Database, req: MiracleFastifyRequest<RouteGenericInterface>, rep: MiracleFastifyReply): Promise<Session | null> {
    if(req.cookies.Token === undefined) {
        rep.code(403); rep.send();
        return null;
    }
    const session = await database.fetch<Session>({ source: "sessions", selectors: { "id": req.cookies.Token } });
    if(session === null) {
        rep.code(403); rep.send();
        return null;
    }

    return session;
}

export async function checkPrerequisites(database: Database, session: Session, prerequisites: Record<string, string>, body: any, rep: MiracleFastifyReply): Promise<boolean> {
    const promises: Promise<{ key: string, result: boolean }>[] = [];
    for(const key in prerequisites) {
        const ids: string[] = [body[key]].flat();
        for(const id of ids) {
            promises.push(new Promise(async(resolve) => {
                const item = await database.fetch<any>({ source: prerequisites[key], selectors: { id, author: session.user } })
                resolve({ key, result: item !== null });
            }));
        }
    }
    const failed = (await Promise.all(promises)).filter(e => !e.result);
    if(failed.length > 0) {
        rep.code(400);
        rep.send({ error: `Objects for ${failed.map(e => `"${e.key}"`).join(", ")} not found` });
        return false;
    }

    return true;
}