/* Routes */
export enum RouteType {
    FETCH = "FETCH",
    FETCH_MULTIPLE = "FETCH_MULTIPLE",
    SESSION_CREATE = "SESSION_CREATE",
}

export type RouteOptions = {
    path: string;
    type: RouteType;
};

export type RouteFetchOptions = RouteOptions & {
    type: RouteType.FETCH;

    table: string;
    idField: string | undefined;
};

export type RouteFetchMultipleOptions = RouteOptions & {
    type: RouteType.FETCH_MULTIPLE;

    table: string;
    idField: string | undefined;
    disableSelectors: boolean | undefined;
};

export type RouteSessionCreateOptions = RouteOptions & {
    type: RouteType.SESSION_CREATE;
};
