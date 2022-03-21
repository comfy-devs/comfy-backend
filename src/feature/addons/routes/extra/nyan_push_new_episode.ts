/* Types */
import { DatabaseType, DatabaseFetchOptions, Status } from "../../../../ts/base";
import { RouteNyanPushNewEpisodeOptions } from "../types";

/* Node Imports */
import { FastifyRequest } from "fastify";
import * as webPush from "web-push";

/* Local Imports */
import APIRoute from "..";
import FeatureAPI from "../../api";
import Database from "../../../../database";

type Request = FastifyRequest<{
    Querystring: { message: string, id: string, adminKey: string };
}>;

class RouteNyanPushNewEpisode extends APIRoute {
    options: RouteNyanPushNewEpisodeOptions;

    constructor(options: RouteNyanPushNewEpisodeOptions) {
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
                if(req.query.message === undefined || req.query.id === undefined || req.query.adminKey === undefined) { rep.code(400); rep.send(); return; }
                if(req.query.adminKey !== process.env.FOXXY_ADMIN_KEY) { rep.code(403); rep.send(); return; }

                /* Fetch eligble users */
                const selectors = { "pushEnabled": "1" };
                const options: DatabaseFetchOptions = { source: "users", selectors: selectors };
                let users = await database.fetchMultiple(options);
                users = users.filter(e => e.favourites.includes(req.query.id));

                /* Send push notification */
                const publicKey = process.env.FOXXY_PUSH_PUBLIC_KEY;
                const privateKey = process.env.FOXXY_PUSH_PRIVATE_KEY;
                if(publicKey === undefined || privateKey === undefined) { return; }

                const notificationPayload = req.query.message;
                const notificationOptions = {
                    vapidDetails: {
                        subject: "https://lamkas.dev",
                        publicKey: publicKey,
                        privateKey: privateKey
                    }
                };
                
                users.forEach(user => {
                    const subscription = {
                        endpoint: user.pushUrl,
                        keys: {
                            p256dh: user.pushKey,
                            auth: user.pushAuth
                        }
                    };
                    webPush.sendNotification(subscription, notificationPayload, notificationOptions);
                });
            }
        );
    }
}

export default RouteNyanPushNewEpisode;
