import { DatabaseOptions } from "database/types";

export type DatabaseMySQLOptions = DatabaseOptions & {
    host: string;
    port: number;
    user: string;
    password?: string;
    passwordEnv?: string;
    database: string;
    structure?: Record<string, Record<string, DatabaseMySQLStructureField>>;
};

export enum DatabaseMySQLFieldModifier {
    ARRAY = "ARRAY",
    BOOLEAN = "BOOLEAN"
};

export type DatabaseMySQLStructureField = {
    modifier?: DatabaseMySQLFieldModifier;
    sensitive?: boolean;
};