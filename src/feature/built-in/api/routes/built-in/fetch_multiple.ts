/* Types */
import { BuiltinRouteType, RouteFetchMultipleOptions } from "./index";
import * as schemas from "./schemas";
import { RequestWithSchemaQuery } from "feature/built-in/api/routes/types";
/* Local Imports */
import APIRoute from "feature/built-in/api/routes";
import FeatureAPI from "feature/built-in/api";
import { getSession, validateSchemaQuery } from "feature/built-in/api/routes/util";
import RouteFetch from "./fetch";

class RouteFetchMultiple extends APIRoute {
    options: RouteFetchMultipleOptions;

    constructor(feature: FeatureAPI, options: RouteFetchMultipleOptions) {
        super(feature, options);
        this.options = options;
    }

    hook(feature: FeatureAPI): void {
        const pathOptions = { config: { rateLimit: { timeWindow: 1000, max: 10 } } };
        if(this.options.singlePath !== undefined) {
            const singleRoute = new RouteFetch(feature, {
                type: BuiltinRouteType.FETCH,
                path: this.options.singlePath, table: this.options.table, idField: this.options.idField, authorField: this.options.authorField,
                select: this.options.select
            });
            singleRoute.hook(feature);
        }
        feature.instance.get(this.path, pathOptions, async (req: RequestWithSchemaQuery<schemas.FetchMultipleSchemaType>, rep) => {
            /* Validate schemas */
            if(!validateSchemaQuery(schemas.FetchMultipleSchema, req, rep)) {
                return;
            }

            /* Construct selectors */
            const selectors: Record<string, string> = { ...this.options.select };
            if(this.options.idField !== undefined) {
                if(req.query.id === undefined) { rep.code(400); rep.send(); return; }
                selectors[this.options.idField] = req.query.id;
            }

            /* Add a selector if route needs an author */
            if(this.options.authorField !== undefined) {
                const session = await getSession(feature.database, req, rep);
                if(session === null) {
                    return;
                }

                selectors[this.options.authorField] = session.user;
            }
            
            /* Get offset and limit */
            const offset = req.query.start ?? 0;
            let limit = this.options.limit;
            if(req.query.end !== undefined) {
                if(req.query.end <= offset) { rep.code(400); rep.send(); return; }
                limit = Math.min(Math.max(req.query.end - offset, 1, this.options.limit ?? req.query.end));
            }

            /* Fetch */
            const items = await feature.database.fetchMultiple({ source: this.options.table, selectors: selectors, offset: limit !== undefined ? offset : undefined, limit: limit, sort: this.options.sort });
            rep.send(items);
        });
    }
}

export default RouteFetchMultiple;
