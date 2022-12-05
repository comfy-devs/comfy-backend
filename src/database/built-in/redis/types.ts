import { DatabaseOptions } from "database/types";

export type DatabaseRedisOptions = DatabaseOptions & {
    host: string;
    port: number;
    user: string;
    password?: string;
    passwordEnv?: string;
};