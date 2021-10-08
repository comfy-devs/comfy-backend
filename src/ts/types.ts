/* Master Server */
export type ServerConfig = {
    instances: ServerInstanceConfig[];
};

/* Worker Server */
export type ServerInstanceConfig = {
    id: string;
    name: string;
    features: InstanceFeatureConfig[];
    databases: InstanceDatabaseConfig[];
};

/* Features */
export enum FeatureType {
    STATIC = "STATIC",
    API = "API",
}

export type InstanceFeatureConfig = {
    id: string;
    name: string;
    type: FeatureType;
    options: FeatureStaticOptions;
};

export type FeatureStaticOptions = {
    port: number;
    allowedOrigins: string[];
    root: string;
};

/* Databases */
export enum DatabaseType {
    MYSQL = "MYSQL",
}

export type InstanceDatabaseConfig = {
    id: string;
    name: string;
    type: DatabaseType;
    options: DatabaseMySqlOptions;
};

/* Databases (MySQL) */
export type DatabaseMySqlOptions = {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    structure: DatabaseMySQLStructure;
};

export type DatabaseMySQLStructure = {
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

/* Databases (Other) */
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
