/* Types */
import { DatabaseType, DatabaseFetchOptions, Status } from "../../../../ts/base";
import { RouteNyanFavouriteOptions } from "../types";

/* Node Imports */
import { FastifyRequest } from "fastify";

/* Local Imports */
import APIRoute from "..";
import FeatureAPI from "../../api";
import Database from "../../../../database";

type Request = FastifyRequest<{
    Querystring: { id: string };
}>;

class RouteNyanFavourite extends APIRoute {
    options: RouteNyanFavouriteOptions;

    constructor(options: RouteNyanFavouriteOptions) {
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
                if(req.query.id === undefined) { rep.code(400); rep.send(); return; }

                /* Fetch */
                const selectors = { id: req.query.id };
                const options: DatabaseFetchOptions = { source: "animes", selectors: selectors };
                const item = await database.fetch(options);
                if (item === undefined) {
                    rep.code(404); rep.send();
                    return;
                }

                /* Check if user is logged in */
                if(req.cookies.Token === undefined) { rep.code(403); rep.send(); return; }
                const session = await database.fetch({ source: "sessions", selectors: { "id": req.cookies.Token } });
                if(session === undefined) { rep.code(403); rep.send(); return; }
                const user = await database.fetch({ source: "users", selectors: { "id": session.user } });
                if(user === undefined) { rep.code(403); rep.send(); return; }

                /* Edit entry */
                if(!user.favourites.includes(req.query.id)) {
                    user.favourites.push(req.query.id);
                    database.edit({ destination: "users", selectors: { id: user.id }, item: { favourites: user.favourites } });
                    database.edit({ destination: "animes", selectors: { id: item.id }, item: { favourites: item.favourites + 1 } });
                }
                
                rep.send(user);
            }
        );
    }
}

export default RouteNyanFavourite;
