/* Types */
import { RouteFetchOptions } from "./index";
import * as schemas from "./schemas";
import { RequestWithSchemaQuery } from "feature/built-in/api/routes/types";
/* Local Imports */
import APIRoute from "feature/built-in/api/routes";
import FeatureAPI from "feature/built-in/api";
import { getSession, validateSchemaQuery } from "feature/built-in/api/routes/util";

class RouteFetch extends APIRoute {
    options: RouteFetchOptions;

    constructor(feature: FeatureAPI, options: RouteFetchOptions) {
        super(feature, options);
        this.options = options;
    }

    hook(feature: FeatureAPI): void {
        feature.instance.get(this.path,
            { config: { rateLimit: { timeWindow: 1000, max: 10 } } },
            async (req: RequestWithSchemaQuery<schemas.FetchSchemaType>, rep) => {
                /* Validate schemas */
                if(!validateSchemaQuery(schemas.FetchSchema, req, rep)) {
                    return;
                }

                /* Construct selectors */
                const selectors = { ...this.options.select, [this.options.idField === undefined ? "id": this.options.idField]: req.query.id };

                /* Add a selector if route needs an author */
                if(this.options.authorField !== undefined) {
                    const session = await getSession(feature.database, req, rep);
                    if(session === null) {
                        return;
                    }

                    selectors[this.options.authorField] = session.user;
                }

                /* Fetch */
                const item = await feature.database.fetch({ source: this.options.table, selectors: selectors });
                if (item === null) {
                    rep.code(404); rep.send();
                    return;
                }

                rep.send(item);
            }
        );
    }
}

export default RouteFetch;
