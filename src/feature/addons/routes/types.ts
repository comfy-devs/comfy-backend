/* Routes */
export enum RouteType {
    FETCH = "FETCH",
    FETCH_MULTIPLE = "FETCH_MULTIPLE",
    SESSION_CREATE = "SESSION_CREATE",
    AUTH_CREATE = "AUTH_CREATE",
    PUSH_SEND = "PUSH_SEND",
    PUSH_SUBSCRIBE = "PUSH_SUBSCRIBE",
    PUSH_UNSUBSCRIBE = "PUSH_UNSUBSCRIBE",
    NYAN_STATS = "NYAN_STATS",
    NYAN_PUSH_NEW_EPISODE = "NYAN_PUSH_NEW_EPISODE",
    NYAN_FAVOURITE = "NYAN_FAVOURITE",
    NYAN_UNFAVOURITE = "NYAN_UNFAVOURITE",
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
};

export type RouteFetchMultipleOptions = RouteOptions & {
    type: RouteType.FETCH_MULTIPLE;

    table: string;
    idField?: string;
    authorField?: string;
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

export type RouteNyanStatsOptions = RouteOptions & {
    type: RouteType.NYAN_STATS;
};

export type RouteNyanPushNewEpisodeOptions = RouteOptions & {
    type: RouteType.NYAN_PUSH_NEW_EPISODE;
};

export type RouteNyanFavouriteOptions = RouteOptions & {
    type: RouteType.NYAN_FAVOURITE;
};

export type RouteNyanUnfavouriteOptions = RouteOptions & {
    type: RouteType.NYAN_UNFAVOURITE;
};
