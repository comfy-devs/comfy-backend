/* Types */
import { DatabaseFetchOptions, Status } from "../../../ts/base";
import { DatabaseRedisOptions } from "../../types";

/* Node Imports */
import { createClient, RedisClient } from "redis";

/* Local Imports */
import Database from "../..";
import Instance from "../../../instance";

class DatabaseRedis extends Database {
    options: DatabaseRedisOptions;
    connection: RedisClient | undefined;

    constructor(parent: Instance, options: DatabaseRedisOptions) {
        super(parent, options);
        this.options = options;
    }

    async start(): Promise<void> {
        await new Promise((resolve) => {
            this.connection = createClient({ host: this.options.host, port: this.options.port });
            this.connection.on("connect", () => {
                resolve(0);
            });
            this.connection.on("error", (e) => {
                this.state = { status: Status.ERROR, message: e.message };
                resolve(0);
            });
        });
    }

    async validate(): Promise<void> {
        /* */
    }

    async fetch(options: DatabaseFetchOptions): Promise<any> {
        const item: Record<string, string> = await new Promise((resolve, reject) => {
            if (this.connection === undefined) {
                return;
            }
            this.connection.hgetall(options.source, (e, r) => {
                if (e) {
                    reject(e);
                    return;
                }
                resolve(r);
            });
        });
        return item;
    }
}

export default DatabaseRedis;
