/* Types */
import { DatabaseAddOptions, DatabaseEditOptions, DatabaseFetchOptions, Status } from "../../../ts/base";
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
        setInterval(() => { this.fetch({ source: "animes", selectors: { id: "0" } }); }, 1000 * 60 * 5);
    }

    async fetch(options: DatabaseFetchOptions): Promise<any> {
        if (this.connection === undefined) {
            return;
        }
        const items: any[] = await this.connection.execute(`SELECT * FROM ${options.source} ${this.selectorsToSyntax(options.selectors)} LIMIT 1`, this.selectorsToData(options.selectors));
        return items[0][0];
    }

    async fetchMultiple(options: DatabaseFetchOptions): Promise<any> {
        if (this.connection === undefined) {
            return;
        }
        const items: any[] = await this.connection.execute(`SELECT * FROM ${options.source} ${this.selectorsToSyntax(options.selectors)}`, this.selectorsToData(options.selectors));
        return items[0];
    }

    async add(options: DatabaseAddOptions): Promise<any> {
        if (this.connection === undefined) {
            return;
        }
        await this.connection.execute(`INSERT INTO ${options.destination} (${this.itemToKeys(options.item)}) VALUES (${this.itemToValueQuestions(options.item)})`, this.itemToValues(options.item));
    }

    async edit(options: DatabaseEditOptions): Promise<any> {
        if (this.connection === undefined) {
            return;
        }
        await this.connection.execute(`UPDATE ${options.destination} SET ${this.itemToKeysWithQuestions(options.item)} ${this.selectorsToSyntax(options.selectors)}`, this.itemToValues(options.item).concat(this.selectorsToData(options.selectors)));
    }

    selectorsToSyntax(selectors: Record<string, string>): string {
        const list = Object.keys(selectors);
        if (list.length > 0) {
            return `WHERE (${list.reduce((acc, curr) => { return `${acc}${curr} = ?, `; }, "").slice(0, -2)})`;
        }

        return "";
    }

    selectorsToData(selectors: Record<string, string>): string[] {
        const list = Object.values(selectors);
        return list;
    }

    itemToKeys(item: Record<string, string>): string {
        const list = Object.keys(item);
        return list.join(", ");
    }

    itemToKeysWithQuestions(item: Record<string, string>): string {
        return Object.keys(item).reduce((acc, curr) => { return `${acc}${curr} = ?, `; }, "").slice(0, -2);
    }

    itemToValueQuestions(item: Record<string, string>): string {
        return Object.values(item).reduce((acc) => { return `${acc}?, `; }, "").slice(0, -2);
    }

    itemToValues(item: Record<string, string>): string[] {
        const list = Object.values(item);
        return list;
    }

}

export default DatabaseMySQL;
