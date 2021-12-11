/* Types */
import { DatabaseFetchOptions, Status } from "../../../ts/base";
import { DatabaseMySQLOptions } from "../../types";

/* Node Imports */
import { createConnection, Connection } from "mysql2/promise";

/* Local Imports */
import Database from "../..";
import Instance from "../../../instance";

class DatabaseMySQL extends Database {
    options: DatabaseMySQLOptions;
    connection: void | Connection | undefined;

    constructor(parent: Instance, options: DatabaseMySQLOptions) {
        super(parent, options);
        this.options = options;
    }

    async start(): Promise<void> {
        this.connection = await createConnection({
            host: this.options.host,
            user: this.options.user,
            password: this.options.password,
            database: this.options.database,
            charset: "utf8mb4",
        }).catch((e) => {
            this.state = { status: Status.ERROR, message: e.message };
        });
    }

    async fetch(options: DatabaseFetchOptions): Promise<any> {
        if (this.connection === undefined) {
            return;
        }
        const items: any[] = await this.connection.execute(`SELECT * FROM ${options.source}${this.selectorsToSyntax(options.selectors)} LIMIT 1`, this.selectorsToData(options.selectors));
        return items[0][0];
    }

    async fetchMultiple(options: DatabaseFetchOptions): Promise<any> {
        if (this.connection === undefined) {
            return;
        }
        const items: any[] = await this.connection.execute(`SELECT * FROM ${options.source}${this.selectorsToSyntax(options.selectors)}`, this.selectorsToData(options.selectors));
        return items[0];
    }

    selectorsToSyntax(selectors: Record<string, string>): string {
        const list = Object.keys(selectors);
        if (list.length > 0) {
            return ` WHERE${
                (list.reduce((acc, curr) => {
                    return acc + ` ${curr} = ?`;
                }),
                "")
            }`;
        }

        return "";
    }

    selectorsToData(selectors: Record<string, string>): string[] {
        const list = Object.values(selectors);
        return list;
    }
}

export default DatabaseMySQL;
