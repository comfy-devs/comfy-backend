/* Types */
import { Status, DatabaseFetchOptions } from "../../ts/types";
import InstanceDatabase from "../database";

/* Node Imports */
import { createConnection } from "mysql2/promise";

class InstanceMySQLDatabase extends InstanceDatabase {
    connection: any;

    async start(): Promise<void> {
        this.connection = await createConnection({
            host: this.config.options.host,
            user: this.config.options.user,
            password: this.config.options.password,
            database: this.config.options.database,
        }).catch((e) => {
            this.state = { status: Status.ERROR, message: e.message };
        });
    }

    async validate(): Promise<void> {
        for (const table of Array.from(this.config.options.structure.tables.values())) {
            await this.connection.execute(`CREATE TABLE IF NOT EXISTS ${table.name} (
                id VARCHAR(32),
                PRIMARY KEY (id)
            )`);

            for (const column of Array.from(table.columns.values())) {
                const exists = await this.connection.execute(`SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${table.name}' AND COLUMN_NAME = '${column.name}'`);
                if (exists[0][0]["COUNT(*)"] < 1) {
                    await this.connection.execute(`ALTER TABLE ${table.name} ADD COLUMN ${column.name} ${column.type}`);
                }
            }
        }
    }

    async fetch(options: DatabaseFetchOptions): Promise<any> {
        return await this.connection.execute(`SELECT * FROM ${options.table} WHERE id = "${options.id}"`);
    }
}

export default InstanceMySQLDatabase;
