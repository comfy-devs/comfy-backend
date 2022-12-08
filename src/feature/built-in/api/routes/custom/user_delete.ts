/* Types */
import { IDSchema, IDSchemaType, RequestWithSchemaQuery } from "feature/built-in/api/routes/types";
/* Local Imports */
import APIRoute from "feature/built-in/api/routes";
import FeatureAPI from "feature/built-in/api";
import { getSession, validateSchemaQuery } from "feature/built-in/api/routes/util";

class RouteUserDelete extends APIRoute {
    hook(feature: FeatureAPI): void {
        feature.instance.delete(this.path,
            { config: { rateLimit: { timeWindow: 10000, max: 1 } } },
            async (req: RequestWithSchemaQuery<IDSchemaType>, rep) => {
                /* Validate schemas */
                if(!validateSchemaQuery(IDSchema, req, rep)) {
                    return;
                }

                /* Get session */
                const session = await getSession(feature.database, req, rep);
                if(session === null) {
                    return;
                }
                if(session.user !== req.query.id) {
                    rep.code(403); rep.send();
                    return;
                }

                /* Get user */
                const user = await feature.database.fetch<User>({ source: "users", selectors: { id: session.user } });
                if (user === null) {
                    rep.code(404); rep.send();
                    return;
                }

                /* Delete user */
                feature.database.delete({ source: "users", selectors: { id: user.id } });

                /* Decrement favourites on favourited shows */
                const animes = await feature.database.fetchMultiple<Anime>({ source: "animes", selectors: { author: user.id } });
                for(const anime of animes.filter(e => user.favourites.includes(e.id))) {
                    feature.database.edit({ destination: "animes", selectors: { id: anime.id }, item: { favourites: anime.favourites - 1 } });
                }

                /* Delete rest */
                feature.database.delete({ source: "sessions", selectors: { user: user.id } });

                /* Send */
                rep.code(200);  rep.send();
            }
        );
    }
}

export default RouteUserDelete;
