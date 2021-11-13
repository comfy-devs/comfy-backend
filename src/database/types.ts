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
    structure: DatabaseMySQLStructure;
};

export type DatabaseMySQLStructure = DatabaseOptions & {
    tables: DatabaseMySQLTable[];
};

export type DatabaseMySQLTable = {
    name: string;
    columns: DatabaseMySQLColumn[];
};

export type DatabaseMySQLColumn = {
    name: string;
    type: string;
};

/* Redis */
export type DatabaseRedisOptions = DatabaseOptions & {
    type: DatabaseType.REDIS;

    host: string;
    port: number;
};
