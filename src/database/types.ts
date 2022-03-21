/* Types */
import { DatabaseOptions, DatabaseType } from "../ts/base";

/* MySQL */
export enum DatabaseMySQLFieldModifier {
    ARRAY = "ARRAY"
}

export type DatabaseMySQLOptions = DatabaseOptions & {
    type: DatabaseType.MYSQL;

    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    structure?: Record<string, Record<string, DatabaseMySQLStructureField>>;
};

export type DatabaseMySQLStructureField = {
    modifier?: string;
    sensitive?: boolean;
};
