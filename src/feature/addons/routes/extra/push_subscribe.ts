/* Types */
import { DatabaseType, Status } from "../../../../ts/base";
import { RoutePushSubscribeOptions } from "../types";

/* Node Imports */
import { FastifyRequest } from "fastify";

/* Local Imports */
import APIRoute from "..";
import FeatureAPI from "../../api";
import Database from "../../../../database";

type Request = FastifyRequest<{
    Querystring: { url: string, key: string, auth: string };
}>;

class RoutePushSubscribe extends APIRoute {
    options: RoutePushSubscribeOptions;

    constructor(options: RoutePushSubscribeOptions) {
        super(options);
        this.options = options;
    }

    async hook(feature: FeatureAPI): Promise<void> {
        if (feature.instance === null) {
            return;
        }
        if (
            Array.from(feature.parent.databaseContainer.values()).filter((e) => {
                return e.type === DatabaseType.MYSQL;
            }).length === 0
        ) {
            this.state = { status: Status.ERROR, message: "NO_DATABASE_FOUND" };
            return;
        }

        const database: Database = Array.from(feature.parent.databaseContainer.values()).filter((e) => {
            return e.type === DatabaseType.MYSQL;
        })[0];
        feature.instance.post(this.path,
            { config: { rateLimit: { timeWindow: 1000, max: 4 } } },
            async (req: Request, rep) => {
                /* Validate schema */
                if(req.query.url === undefined || req.query.key === undefined || req.query.auth === undefined) { rep.code(400); rep.send(); return; }
                if(req.cookies.Token === undefined) { rep.code(403); rep.send(); return; }

                /* Check if user is logged in */
                const session = await database.fetch({ source: "sessions", selectors: { "id": req.cookies.Token } });
                if(session === undefined) { rep.code(403); rep.send(); return; }

                /* Subscribe to push notifications */
                const options = { destination: "users", selectors: { "id": session.user }, item: { pushEnabled: "1", pushUrl: req.query.url, pushKey: req.query.key, pushAuth: req.query.auth } };
                database.edit(options);

                rep.code(200);
                rep.send();
            }
        );
    }
}

export default RoutePushSubscribe;
