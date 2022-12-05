/* Types */
import { Status } from "ts/backend/base";
import * as baseTypes from "database/types";
import * as types from "./types";
/* Node Imports */
import { createClient, RedisClientType } from "redis";
/* Local Imports */
import Database from "database";
import Instance from "instance";
import { serializeDatabaseItemValue } from "../util";

class DatabaseRedis extends Database {
    options: types.DatabaseRedisOptions;
    connection: RedisClientType;

    constructor(parent: Instance, options: types.DatabaseRedisOptions) {
        super(parent, options);
        this.options = options;
        this.connection = null as unknown as RedisClientType;
    }

    async start(): Promise<void> {
        let password;
        if(this.options.password !== undefined) {
            password = this.options.password;
        } else if(this.options.passwordEnv !== undefined) {
            password = process.env[this.options.passwordEnv];
        } else {
            this.state = { status: Status.ERROR, message: "NO_PASSWORD" };
            return;
        }

        this.connection = createClient({
            url: `redis://${this.options.user}:${password}@${this.options.host}:${this.options.port}`
        });
        await this.connection.connect();
    }

    async fetch<T>(options: baseTypes.DatabaseFetchOptions): Promise<T | null> {
        const item = await this.connection.hGetAll(`${options.source}.${options.selectors}`);
        return item as T | null;
    }

    async fetchMultiple<T>(options: baseTypes.DatabaseFetchMultipleOptions): Promise<T[]> {
        return [];
    }

    async add(options: baseTypes.DatabaseAddOptions): Promise<void> {
        await this.set(options.destination, options.item);
    }
    
    async edit(options: baseTypes.DatabaseEditOptions): Promise<void> {
        await this.set(options.destination, options.item);
    }
    
    async delete(options: baseTypes.DatabaseDeleteOptions): Promise<number> {
        await this.connection.del(`${options.source}.${options.selectors.id}`);
        return 1;
    }

    async set(table: string, item: Record<string, baseTypes.DatabaseUnserializedItemValue>) {
        const multi = this.connection.multi();
        for(const [key, valueRaw] of Object.entries(item)) {
            const value = serializeDatabaseItemValue(valueRaw as baseTypes.DatabaseItemValue);
            if(value !== null) {
                multi.hSet(`${table}.${item.id}`, key, value);
            } else {
                multi.hDel(`${table}.${item.id}`, key);
            }
        }
        await multi.exec();
    }

}

export default DatabaseRedis;
