/* Types */
import { FeatureAPIOptions, RouteType, Status } from "../../ts/types";

/* Node Imports */
import express from "express";
import cors from "cors";
import { Server } from "http";

/* Local Imports */
import Feature from "../feature";
import Instance from "../../instance/instance";
import APIRoute from "../../route/route";
import RouteFetch from "../../route/types/fetch";

class FeatureAPI extends Feature {
    options: FeatureAPIOptions;
    app: express.Express | undefined;
    appServer: Server | undefined;
    routeContainer: Map<string, APIRoute>;

    constructor(parent: Instance, options: FeatureAPIOptions) {
        super(parent, options);
        this.options = options;

        this.routeContainer = new Map();
    }

    async start(): Promise<void> {
        this.app = express();
        const corsCallback = {
            origin: (origin: any, callback: any) => {
                callback(null, this.options.allowedOrigins.indexOf(origin) !== -1);
            },
            credentials: true,
        };
        this.app.use(cors(corsCallback));

        for (const options of this.options.routes) {
            let route: APIRoute | undefined;
            switch (options.type) {
                case RouteType.FETCH:
                    route = new RouteFetch(options);
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

        this.appServer = this.app.listen(this.options.port);
        await new Promise((resolve) => {
            if (this.appServer === undefined) {
                resolve(0);
                return;
            }
            this.appServer.once("error", (e) => {
                this.state = { status: Status.ERROR, message: e.message };
                resolve(0);
            });
            this.appServer.once("listening", () => {
                resolve(0);
            });
        });
    }
}

export default FeatureAPI;
