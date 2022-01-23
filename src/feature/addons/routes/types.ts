/* Routes */
export enum RouteType {
    FETCH = "FETCH",
    FETCH_MULTIPLE = "FETCH_MULTIPLE",
    SESSION_CREATE = "SESSION_CREATE",
    AUTH_CREATE = "AUTH_CREATE",
    PUSH_SEND = "PUSH_SEND",
    PUSH_SUBSCRIBE = "PUSH_SUBSCRIBE",
    PUSH_UNSUBSCRIBE = "PUSH_UNSUBSCRIBE",
}

export type RouteOptions = {
    path: string;
    type: RouteType;
};

export type RouteFetchOptions = RouteOptions & {
    type: RouteType.FETCH;

    table: string;
    idField?: string;
    authorField?: string;
    sensitiveFields?: string[];
};

export type RouteFetchMultipleOptions = RouteOptions & {
    type: RouteType.FETCH_MULTIPLE;

    table: string;
    idField?: string;
    authorField?: string;
    sensitiveFields?: string[];
    disableSelectors?: boolean;
};

export type RouteSessionCreateOptions = RouteOptions & {
    type: RouteType.SESSION_CREATE;
};

export type RouteAuthCreateOptions = RouteOptions & {
    type: RouteType.AUTH_CREATE;
};

export type RoutePushSendOptions = RouteOptions & {
    type: RouteType.PUSH_SEND;
};

export type RoutePushSubscribeOptions = RouteOptions & {
    type: RouteType.PUSH_SUBSCRIBE;
};

export type RoutePushUnsubscribeOptions = RouteOptions & {
    type: RouteType.PUSH_UNSUBSCRIBE;
};
