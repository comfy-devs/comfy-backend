/* Types */
import { DatabaseOptions, DatabaseType } from "../ts/base";

/* MySQL */
export type DatabaseMySQLOptions = DatabaseOptions & {
    type: DatabaseType.MYSQL;

    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
};
