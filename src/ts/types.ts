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
    routes: any[];
};

/* Routes */
export enum RouteType {
    FETCH = "FETCH",
    SESSION_CREATE = "SESSION_CREATE",
}

export type RouteOptions = {
    path: string;
    type: RouteType;
};

export type RouteFetchOptions = RouteOptions & {
    type: RouteType.FETCH;

    table: string;
};

export type RouteSessionCreateOptions = RouteOptions & {
    type: RouteType.SESSION_CREATE;
};

/* Databases */
export enum DatabaseType {
    MYSQL = "MYSQL",
    REDIS = "REDIS",
}

export type DatabaseOptions = {
    id: string;
    name: string;
    type: DatabaseType;
};

export type DatabaseFetchOptions = {
    source: string;
    selectors: Record<string, string>;
};

/* Database (MySQL) */
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

/* Database (Redis) */
export type DatabaseRedisOptions = DatabaseOptions & {
    type: DatabaseType.REDIS;

    host: string;
    port: number;
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