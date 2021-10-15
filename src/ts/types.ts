/* Master Server */
export type Config = {
    instances: InstanceOptions[];
};

/* Worker Server */
export type InstanceOptions = {
    id: string;
    name: string;
    features: any[];
    databases: any[];
};

/* Features */
export enum FeatureType {
    STATIC = "STATIC",
    API = "API",
}

export type FeatureOptions = {
    id: string;
    name: string;
    type: FeatureType;
};

export type FeatureStaticOptions = FeatureOptions & {
    type: FeatureType.STATIC;

    port: number;
    allowedOrigins: string[];
    root: string;
};

export type FeatureAPIOptions = FeatureOptions & {
    type: FeatureType.API;

    port: number;
    allowedOrigins: string[];
};

/* Databases */
export enum DatabaseType {
    MYSQL = "MYSQL",
}

export type DatabaseOptions = {
    id: string;
    name: string;
    type: DatabaseType;
};

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

export type DatabaseFetchOptions = {
    id: string;
    table: string;
};

/* Statuses */
export type StateDescriptor = {
    status: Status;
    message: string;
};

export enum Status {
    WAITING = "WAITING",
    SUCCESS = "SUCCESS",
    ERROR = "ERROR",
}
