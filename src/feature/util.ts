/* Types */
import { FeatureOptions } from "../ts/base";

/* Node Imports */
import * as fastify from "fastify";
import fastifyCors from "fastify-cors";
import { readFileSync } from "fs";

export function createFastifyInstance(options: FeatureOptions): fastify.FastifyInstance | Error {
    let instance: fastify.FastifyInstance;
    if (options.https) {
        instance = fastify.fastify({
            https: {
                cert: readFileSync(`configs/features/${options.id}/cert.crt`),
                key: readFileSync(`configs/features/${options.id}/key.key`),
            },
        });
    } else {
        instance = fastify.fastify();
    }
    if (instance === undefined) {
        return new Error("Instance failed to start!");
    }
    instance.register(fastifyCors, {
        origin: options.allowedOrigins,
        credentials: true,
    });

    return instance;
};


export async function startFastifyInstance(instance: fastify.FastifyInstance, options: FeatureOptions): Promise<Error | null> {
    return await new Promise((resolve) => {
        if (instance === undefined) {
            resolve(new Error("Instance failed to start!"));
            return;
        }
        instance.listen(options.port, "0.0.0.0", (e) => {
            if (e) {
                resolve(e);
                return;
            }
            resolve(null);
        });
    });
};
