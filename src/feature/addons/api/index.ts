/* Types */
import { Status } from "../../../ts/base";
import { RouteType } from "../routes/types";
import { FeatureAPIOptions } from "./types";

/* Node Imports */
import * as fastify from "fastify";

/* Local Imports */
import Feature from "../..";
import Instance from "../../../instance";
import APIRoute from "../routes";
import RouteFetch from "../routes/extra/fetch";
import RouteFetchMultiple from "../routes/extra/fetch_multiple";
import RouteSessionCreate from "../routes/extra/session_create";
import RouteAuthCreate from "../routes/extra/auth_create";
import RoutePushSend from "../routes/extra/push_send";
import RoutePushSubscribe from "../routes/extra/push_subscribe";
import RoutePushUnsubscribe from "../routes/extra/push_unsubscribe";
import RouteStats from "../routes/extra/stats";
import { createFastifyInstance, startFastifyInstance } from "../../util";

class FeatureAPI extends Feature {
    options: FeatureAPIOptions;
    instance: fastify.FastifyInstance | null;
    routeContainer: Map<string, APIRoute>;

    constructor(parent: Instance, options: FeatureAPIOptions) {
        super(parent, options);
        this.options = options;
        this.instance = null;

        this.routeContainer = new Map();
    }

    async start(): Promise<void> {
        const result = await createFastifyInstance(this.options);
        if (result instanceof Error) {
            this.state = { status: Status.ERROR, message: result.message };
            return;
        }
        this.instance = result;

        for (const options of this.options.routes) {
            let route: APIRoute | undefined;
            switch (options.type) {
                case RouteType.FETCH:
                    route = new RouteFetch(options);
                    break;

                case RouteType.FETCH_MULTIPLE:
                    route = new RouteFetchMultiple(options);
                    break;

                case RouteType.SESSION_CREATE:
                    route = new RouteSessionCreate(options);
                    break;

                case RouteType.AUTH_CREATE:
                    route = new RouteAuthCreate(options);
                    break;
                case RouteType.PUSH_SEND:
                    route = new RoutePushSend(options);
                    break;

                case RouteType.PUSH_SUBSCRIBE:
                    route = new RoutePushSubscribe(options);
                    break;

                case RouteType.PUSH_UNSUBSCRIBE:
                    route = new RoutePushUnsubscribe(options);
                    break;

                case RouteType.PUSH_SEND:
                    route = new RoutePushSend(options);
                    break;

                case RouteType.PUSH_SUBSCRIBE:
                    route = new RoutePushSubscribe(options);
                    break;

                case RouteType.PUSH_UNSUBSCRIBE:
                    route = new RoutePushUnsubscribe(options);
                    break;

                case RouteType.PUSH_SEND:
                    route = new RoutePushSend(options);
                    break;

                case RouteType.PUSH_SUBSCRIBE:
                    route = new RoutePushSubscribe(options);
                    break;

                case RouteType.PUSH_UNSUBSCRIBE:
                    route = new RoutePushUnsubscribe(options);
                    break;

                case RouteType.STATS:
                    route = new RouteStats(options);
                    break;
            }

            if (route === undefined) {
                continue;
            }
            this.routeContainer.set(route.path, route);
        }

        for (const route of Array.from(this.routeContainer.values())) {
            await route.hook(this);
            if (route.state.status !== Status.WAITING) {
                this.state = { status: Status.ERROR, message: `${route.path} - ${route.state.message}` };
                return;
            }

            route.state = { status: Status.SUCCESS, message: "SUCCESS" };
        }

        startFastifyInstance(this.instance, this.options);
    }
}

export default FeatureAPI;
