import { RouteFetchStructuredItemImportedOptions, RouteFetchStructuredItemOptions } from "feature/built-in/api/routes/built-in";

/* Root Options */
export type RootOptions = {
    instances: string[];
};

/* Worker Server */
export type InstanceOptions = {
    id: string;
    name: string;
    features: string[];
    databases: string[];
};

/* API Structures */
export type APIStructure = Record<string, RouteFetchStructuredItemOptions>;
export type APIStructureImported = Record<string, RouteFetchStructuredItemImportedOptions>;
export type APIStructureImportedDetails = {
    hasAuthorField: boolean;
    needsQueryId: boolean;
};

export type APIStructureOptions = {
    id: string;
    structure: APIStructure;
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

/* Structures */
export type Session = {
    id: string;
    user: string;
};

export type User = {
    id: string;
    username: string;
    password?: string;
    timestamp: number;
};