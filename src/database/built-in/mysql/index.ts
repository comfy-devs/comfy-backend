/* Types */
import { Status } from "ts/backend/base";
import * as baseTypes from "database/types";
import * as types from "./types";
/* Node Imports */
import { createConnection, Connection, FieldPacket } from "mysql2/promise";
/* Local Imports */
import Database from "database";
import Instance from "instance";
import { stringToArray } from "util/general";
import { serializeDatabaseItemValue } from "../util";

class DatabaseMySQL extends Database {
    options: types.DatabaseMySQLOptions;
    connection: Connection;

    constructor(parent: Instance, options: types.DatabaseMySQLOptions) {
        super(parent, options);
        this.options = options;
        this.connection = null as unknown as Connection;
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

        this.connection = await createConnection({
            host: this.options.host,
            port: this.options.port,
            user: this.options.user,
            password: password,
            database: this.options.database,
            charset: "utf8mb4",
        }).catch((e) => {
            this.state = { status: Status.ERROR, message: e.message };
            return null as unknown as Connection;
        });
        setInterval(() => { this.fetch({ source: "users", selectors: { id: "0" } }); }, 1000 * 60 * 5);
    }

    async fetch<T>(options: baseTypes.DatabaseFetchOptions): Promise<T | null> {
        try {
            let query = `SELECT * FROM \`${options.source}\` ${this.selectorsToSyntax(options.selectors)}`;
            if(options.sort !== undefined) {
                query += ` ORDER BY ${options.sort.field} ${options.sort.order ?? "ASC"}`;
            }
            query += " LIMIT 1";

            const items: [any, FieldPacket[]] = await this.connection.execute(query, this.selectorsToData(options.selectors));
            return this.deserialize<T>(options, items[0][0]);
        } catch(e) {
            console.error("Error trying to fetch an item:");
            console.log(options);
            console.error(e);
            throw e;
        }
    }

    async fetchMultiple<T>(options: baseTypes.DatabaseFetchMultipleOptions): Promise<T[]> {
        try {
            if (this.connection === undefined) {
                return [];
            }
            let query = `SELECT * FROM \`${options.source}\` ${this.selectorsToSyntax(options.selectors)}`;
            if(options.sort !== undefined) {
                query += ` ORDER BY ${options.sort.field} ${options.sort.order ?? "ASC"}`;
            }
            if(options.limit !== undefined) {
                query += ` LIMIT ${options.limit}`;
            }
            if(options.offset !== undefined) {
                query += ` OFFSET ${options.offset}`;
            }

            const items: [any, FieldPacket[]] = await this.connection.execute(query, this.selectorsToData(options.selectors));
            return items[0].map((item: T) => this.deserialize<T>(options, item));
        } catch(e) {
            console.error("Error trying to fetch items:");
            console.log(options);
            console.error(e);
            throw e;
        }
    }

    async add(options: baseTypes.DatabaseAddOptions): Promise<void> {
        try {
            if (this.connection === undefined) {
                return;
            }
            const item = this.serialize(options.destination, options.item);
            const values = this.itemToValues(item);
            await this.connection.execute(`INSERT INTO \`${options.destination}\` (${this.itemToKeys(item)}) VALUES (${this.itemToValuesWithQuestions(item)})`, values);
        } catch(e) {
            console.error("Error trying to add an item:");
            console.log(options);
            console.error(e);
            throw e;
        }
    }

    async edit(options: baseTypes.DatabaseEditOptions): Promise<void> {
        try {
            if (this.connection === undefined) {
                return;
            }
            const item = this.serialize(options.destination, options.item);
            const values = this.itemToValues(item).concat(this.selectorsToData(options.selectors));
            await this.connection.execute(`UPDATE \`${options.destination}\` SET ${this.itemToKeysWithQuestions(item)} ${this.selectorsToSyntax(options.selectors)}`, values);
        } catch(e) {
            console.error("Error trying to edit an item:");
            console.log(options);
            console.error(e);
            throw e;
        }
    }

    async delete(options: baseTypes.DatabaseDeleteOptions): Promise<number> {
        try {
            if (this.connection === undefined) {
                return -1;
            }
            const values = this.selectorsToData(options.selectors);
            const items: [any, FieldPacket[]] = await this.connection.execute(`DELETE FROM \`${options.source}\` ${this.selectorsToSyntax(options.selectors)}`, values);
            return items[0].affectedRows;
        } catch(e) {
            console.error("Error trying to delete an item:");
            console.log(options);
            console.error(e);
            throw e;
        }
    }

    selectorsToSyntax(selectors: Record<string, baseTypes.DatabaseSelectorValue>): string {
        const list = Object.keys(selectors);
        if (list.length > 0) {
            return `WHERE ${list.map((e) => `\`${e}\` ${(typeof(selectors[e]) !== "object" ? "=" : (selectors[e] as baseTypes.DatabaseFetchSelector).comparison)} ?`).join(" AND ")}`;
        }

        return "";
    }

    selectorsToData(selectors: Record<string, baseTypes.DatabaseSelectorValue>): string[] {
        return Object.values(selectors).map(e => typeof(e) !== "object" ? e.toString() : e.value.toString());
    }

    itemToKeys(item: Record<string, baseTypes.DatabaseItemValue>): string {
        return Object.keys(item).map(e => `\`${e}\``).join(", ");
    }

    itemToKeysWithQuestions(item: Record<string, baseTypes.DatabaseItemValue>): string {
        return Object.keys(item).map(e => `\`${e}\` = ?`).join(", ");
    }

    itemToValues(item: Record<string, baseTypes.DatabaseItemValue>): (string | null)[] {
        return Object.values(item).map(e => serializeDatabaseItemValue(e));
    }

    itemToValuesWithQuestions(item: Record<string, baseTypes.DatabaseItemValue>): string {
        return Object.values(item).map(() => "?").join(", ");
    }

    deserialize<T>(options: baseTypes.DatabaseFetchOptions, item: any): T | null {
        if(item === undefined) {
            return null;
        }

        const newItem: any = item;
        if(this.options.structure !== undefined && this.options.structure[options.source] !== undefined) {
            const fields = Object.keys(this.options.structure[options.source]).filter(e => newItem[e] !== undefined);
            for(const field of fields) {
                /* Apply modifiers */
                const fieldOptions = this.options.structure[options.source][field];
                switch(fieldOptions.modifier) {
                    case types.DatabaseMySQLFieldModifier.ARRAY:
                        newItem[field] = stringToArray(newItem[field]);
                        break;
                    case types.DatabaseMySQLFieldModifier.BOOLEAN:
                        newItem[field] = newItem[field] === 1;
                        break;
                }

                /* Apply other options */
                if(options.ignoreSensitive !== true && fieldOptions.sensitive === true) {
                    delete newItem[field];
                }
            }
        }

        return newItem;
    }

    serialize(table: string, item: Record<string, baseTypes.DatabaseUnserializedItemValue>): Record<string, baseTypes.DatabaseItemValue> {
        const newItem: any = item;
        if(this.options.structure !== undefined && this.options.structure[table] !== undefined) {
            const fields = Object.keys(this.options.structure[table]).filter(e => newItem[e] !== undefined);
            for(const field of fields) {
                /* Apply modifiers */
                const fieldOptions = this.options.structure[table][field];
                switch(fieldOptions.modifier) {
                    case types.DatabaseMySQLFieldModifier.ARRAY:
                        const fieldArray = newItem[field] as string[];
                        newItem[field] = fieldArray.join(",");
                        break;
                }
            }
        }

        return newItem;
    }

}

export default DatabaseMySQL;
