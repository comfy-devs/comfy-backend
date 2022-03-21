/* Root Options */
export type RootOptions = {
    instances: string[];
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

    port: number;
    https: boolean;
    cors?: {
        origins: string[];
    };
    rateLimit?: boolean;
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
    ignoreSensitive?: boolean;
};

export type DatabaseAddOptions = {
    destination: string;
    item: Record<string, string | number>;
};

export type DatabaseEditOptions = {
    destination: string;
    selectors: Record<string, string>;
    item: Record<string, string | number>;
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
