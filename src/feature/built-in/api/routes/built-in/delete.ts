/* Types */
import { DatabaseDeleteOptions, DatabaseSelectorValue } from "database/types";
import { RouteDeleteOptions } from "./index";
import * as schemas from "./schemas";
import { RequestWithSchemaQuery } from "feature/built-in/api/routes/types";
import { Session } from "ts/backend/base";
/* Local Imports */
import APIRoute from "feature/built-in/api/routes";
import FeatureAPI from "feature/built-in/api";
import { validateSchemaQuery } from "../util";

class RouteDelete extends APIRoute {
    options: RouteDeleteOptions;

    constructor(feature: FeatureAPI, options: RouteDeleteOptions) {
        super(feature, options);
        this.options = options;
    }

    hook(feature: FeatureAPI): void {
        feature.instance.delete(this.path,
            { config: { rateLimit: { timeWindow: 1000, max: 10 } } },
            async (req: RequestWithSchemaQuery<schemas.DeleteSchemaType>, rep) => {
                /* Validate schemas */
                if(!validateSchemaQuery(schemas.DeleteSchema, req, rep)) {
                    return;
                }

                /* Delete */
                const selectors: Record<string, DatabaseSelectorValue> = { [this.options.idField === undefined ? "id": this.options.idField]: req.query.id };
                if(this.options.authorField !== undefined) {
                    if(req.cookies.Token === undefined) { rep.code(403); rep.send(); return; }
                    const session = await feature.database.fetch<Session>({ source: "sessions", selectors: { "id": req.cookies.Token } });
                    if(session === null) { rep.code(403); rep.send(); return; }
                    selectors[this.options.authorField] = session.user;
                }

                const options: DatabaseDeleteOptions = { source: this.options.table, selectors: selectors };
                feature.database.delete(options);

                rep.code(200);
                rep.send();
            }
        );
    }
}

export default RouteDelete;
