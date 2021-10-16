/* Types */
import { DatabaseMySQLOptions, DatabaseFetchOptions, Status } from "../../ts/types";

/* Node Imports */
import { createConnection, Connection } from "mysql2/promise";

/* Local Imports */
import Database from "../database";
import Instance from "../../instance/instance";

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

    async validate(): Promise<void> {
        if (this.connection === undefined) {
            return;
        }
        for (const table of this.options.structure.tables) {
            await this.connection.execute(`CREATE TABLE IF NOT EXISTS ${table.name} (
                id VARCHAR(32),
                PRIMARY KEY (id)
            )`);

            for (const column of table.columns) {
                const exists: any[] = await this.connection.execute(`SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ? AND COLUMN_NAME = ?`, [table.name, column.name]);
                if (exists[0][0]["COUNT(*)"] < 1) {
                    await this.connection.execute(`ALTER TABLE ${table.name} ADD COLUMN ${column.name} ${column.type}`);
                }
            }
        }
    }

    async fetch(options: DatabaseFetchOptions): Promise<any> {
        if (this.connection === undefined) {
            return;
        }
        const items: any[] = await this.connection.execute(`SELECT * FROM ${options.table} WHERE id = ?`, [options.id]);
        return items[0][0];
    }
}

export default DatabaseMySQL;
