import Instance from "instance";
import Database from "database";
import * as types from "database/types";
import DatabaseMySQL from "./mysql";
import DatabaseRedis from "./redis";
import { DatabaseMySQLOptions } from "./mysql/types";
import { DatabaseRedisOptions } from "./redis/types";

export enum BuiltinDatabaseType {
    MYSQL = "MYSQL",
    REDIS = "REDIS",
};

const databases: Record<BuiltinDatabaseType, (parent: Instance, options: types.DatabaseOptions) => Database> = {
    [BuiltinDatabaseType.MYSQL]: (parent: Instance, options: types.DatabaseOptions) => {return new DatabaseMySQL(parent, options as DatabaseMySQLOptions);},
    [BuiltinDatabaseType.REDIS]: (parent: Instance, options: types.DatabaseOptions) => {return new DatabaseRedis(parent, options as DatabaseRedisOptions);}
}
export default databases;