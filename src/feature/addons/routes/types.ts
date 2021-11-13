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
