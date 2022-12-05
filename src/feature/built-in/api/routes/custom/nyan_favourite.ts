/* Types */
import { RouteOptions } from "../types";
import { IDSchema, IDSchemaType } from "ts/common/zod/base";
import { RequestWithSchema } from "feature/built-in/api/routes/types";
/* Local Imports */
import APIRoute from "feature/built-in/api/routes";
import FeatureAPI from "feature/built-in/api";
import { getSession, validateSchemaBody } from "feature/built-in/api/routes/util"

class RouteNyanFavourite extends APIRoute {
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
                const anime = await feature.database.fetch<Anime>({ source: "animes", selectors: { id: req.body.id } });
                if (anime === null) {
                    rep.code(404); rep.send();
                    return;
                }

                /* Edit entry */
                if(user.favourites.includes(anime.id)) {
                    user.favourites.splice(user.favourites.indexOf(anime.id), 1);
                    feature.database.edit({ destination: "users", selectors: { id: user.id }, item: { favourites: user.favourites } });
                    feature.database.edit({ destination: "animes", selectors: { id: anime.id }, item: { favourites: anime.favourites - 1 } });
                } else {
                    user.favourites.push(anime.id);
                    feature.database.edit({ destination: "users", selectors: { id: user.id }, item: { favourites: user.favourites } });
                    feature.database.edit({ destination: "animes", selectors: { id: anime.id }, item: { favourites: anime.favourites + 1 } });
                }
                
                rep.send(user);
            }
        );
    }
}

export default RouteNyanFavourite;
