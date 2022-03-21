/* Types */
import { DatabaseAddOptions, DatabaseEditOptions, DatabaseFetchOptions, Status } from "../../../ts/base";
import { DatabaseMySQLFieldModifier, DatabaseMySQLOptions } from "../../types";

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
        return this.deserialize(options, items[0][0]);
    }

    async fetchMultiple(options: DatabaseFetchOptions): Promise<any> {
        if (this.connection === undefined) {
            return;
        }
        const items: any[] = await this.connection.execute(`SELECT * FROM ${options.source} ${this.selectorsToSyntax(options.selectors)}`, this.selectorsToData(options.selectors));
        return items[0].map((item: any) => this.deserialize(options, item));
    }

    async add(options: DatabaseAddOptions): Promise<any> {
        if (this.connection === undefined) {
            return;
        }
        const item = this.serialize(options.destination, options.item);
        const values = this.itemToValues(item);
        await this.connection.execute(`INSERT INTO ${options.destination} (${this.itemToKeys(item)}) VALUES (${this.itemToValueQuestions(item)})`, values);
    }

    async edit(options: DatabaseEditOptions): Promise<any> {
        if (this.connection === undefined) {
            return;
        }
        const item = this.serialize(options.destination, options.item);
        const values = this.itemToValues(item).concat(this.selectorsToData(options.selectors));
        await this.connection.execute(`UPDATE ${options.destination} SET ${this.itemToKeysWithQuestions(item)} ${this.selectorsToSyntax(options.selectors)}`, values);
    }

    selectorsToSyntax(selectors: Record<string, string>): string {
        const list = Object.keys(selectors);
        if (list.length > 0) {
            return `WHERE ${list.reduce((acc, curr) => { return `${acc}${curr} = ?, `; }, "").slice(0, -2)}`;
        }

        return "";
    }

    selectorsToData(selectors: Record<string, string>): string[] {
        const list = Object.values(selectors);
        return list;
    }

    itemToKeys(item: Record<string, string | number>): string {
        const list = Object.keys(item);
        return list.join(", ");
    }

    itemToKeysWithQuestions(item: Record<string, string | number>): string {
        return Object.keys(item).reduce((acc, curr) => { return `${acc}${curr} = ?, `; }, "").slice(0, -2);
    }

    itemToValueQuestions(item: Record<string, string | number>): string {
        return Object.values(item).reduce((acc) => { return `${acc}?, `; }, "").toString().slice(0, -2);
    }

    itemToValues(item: Record<string, string>): string[] {
        const list = Object.values(item);
        return list;
    }

    deserialize(options: DatabaseFetchOptions, item: any): any {
        if(this.options.structure !== undefined && this.options.structure[options.source] !== undefined) {
            Object.keys(this.options.structure[options.source]).forEach(field => {
                if(this.options.structure === undefined || item[field] === undefined) { return; }

                /* Apply modifiers */
                const fieldOptions = this.options.structure[options.source][field];
                switch(fieldOptions.modifier) {
                    case DatabaseMySQLFieldModifier.ARRAY:
                        item[field] = item[field].split(",").filter((e: string) => e !== "");
                        break;
                }

                /* Apply other options */
                if(options.ignoreSensitive !== true && fieldOptions.sensitive === true) {
                    delete item[field];
                }
            });
        }

        return item;
    }

    serialize(table: string, item: any): any {
        if(this.options.structure !== undefined && this.options.structure[table] !== undefined) {
            Object.keys(this.options.structure[table]).forEach(field => {
                if(this.options.structure === undefined || item[field] === undefined) { return; }

                /* Apply modifiers */
                const fieldOptions = this.options.structure[table][field];
                switch(fieldOptions.modifier) {
                    case DatabaseMySQLFieldModifier.ARRAY:
                        item[field] = item[field].join(",");
                        break;
                }
            });
        }

        return item;
    }

}

export default DatabaseMySQL;
