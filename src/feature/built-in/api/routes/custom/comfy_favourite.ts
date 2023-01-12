/* Types */
import { RouteOptions } from "../types";
import { IDSchema, IDSchemaType, RequestWithSchema } from "feature/built-in/api/routes/types";
/* Local Imports */
import APIRoute from "feature/built-in/api/routes";
import FeatureAPI from "feature/built-in/api";
import { getSession, validateSchemaBody } from "feature/built-in/api/routes/util"

class RouteComfyFavourite extends APIRoute {
    options: RouteOptions;

    constructor(feature: FeatureAPI, options: RouteOptions) {
        super(feature, options);
        this.options = options;
    }

    async hook(feature: FeatureAPI): Promise<void> {
        feature.instance.post(this.path,
            { config: { rateLimit: { timeWindow: 1000, max: 4 } } },
            async (req: RequestWithSchema<IDSchemaType>, rep) => {
                /* Validate schemas */
                if(!validateSchemaBody(IDSchema, req, rep)) {
                    return;
                }

                /* Get session */
                const session = await getSession(feature.database, req, rep);
                if(session === null) {
                    return;
                }

                /* Get user */
                const user = await feature.database.fetch<User>({ source: "users", selectors: { id: session.user } });
                if (user === null) {
                    rep.code(403); rep.send();
                    return;
                }

                /* Get item */
                const show = await feature.database.fetch<Show>({ source: "shows", selectors: { id: req.body.id } });
                if (show === null) {
                    rep.code(404); rep.send();
                    return;
                }

                /* Edit entry */
                if(user.favourites.includes(show.id)) {
                    user.favourites.splice(user.favourites.indexOf(show.id), 1);
                    feature.database.edit({ destination: "users", selectors: { id: user.id }, item: { favourites: user.favourites } });
                    feature.database.edit({ destination: "shows", selectors: { id: show.id }, item: { favourites: show.favourites - 1 } });
                } else {
                    user.favourites.push(show.id);
                    feature.database.edit({ destination: "users", selectors: { id: user.id }, item: { favourites: user.favourites } });
                    feature.database.edit({ destination: "shows", selectors: { id: show.id }, item: { favourites: show.favourites + 1 } });
                }
                
                rep.send(user);
            }
        );
    }
}

export default RouteComfyFavourite;
