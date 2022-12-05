/* Types */
import { RouteEditOptions } from ".";
import { DatabaseUnserializedItemValue } from "database/types";
import { RequestWithSchema } from "feature/built-in/api/routes/types";
import schemas from "ts/common/zod";
/* Node Imports */
import { z } from "zod";
/* Local Imports */
import APIRoute from "feature/built-in/api/routes";
import FeatureAPI from "feature/built-in/api";
import { checkPrerequisites, getSession, validateSchemaBody } from "feature/built-in/api/routes/util"

class RouteEdit extends APIRoute {
    options: RouteEditOptions;
    schema: z.Schema;

    constructor(feature: FeatureAPI, options: RouteEditOptions) {
        super(feature, options);
        this.options = options;
        this.schema = schemas[this.options.schema];
    }

    hook(feature: FeatureAPI): void {
        feature.instance.post(this.path,
            { config: { rateLimit: { timeWindow: 3000, max: 2 } } },
            async (req: RequestWithSchema<z.infer<typeof this.schema>>, rep) => {
                /* Validate schemas */
                if(!validateSchemaBody(this.schema, req, rep)) {
                    return;
                }

                /* Get session */
                const session = await getSession(feature.database, req, rep);
                if(session === null) {
                    return;
                }

                /* Check prerequisites */
                if(this.options.prerequisites !== undefined) {
                    if(!checkPrerequisites(feature.database, session, this.options.prerequisites, req.body, rep)) {
                        return;
                    }
                }

                /* Edit item (author is checked in selectors) */
                const id = (req.body as any).id;
                const edit = this.editItem(req.body);
                await feature.database.edit({ destination: this.options.table, item: edit, selectors: { id, author: session.user } });

                /* Fetch item */
                const item = await feature.database.fetch({ source: this.options.table, selectors: { id, author: session.user } });
                if(item === null) {
                    rep.code(404); rep.send();
                    return;
                }

                /* Send */
                rep.send(item);
            }
        );
    }

    editItem(body: any): Record<string, DatabaseUnserializedItemValue> {
        const item: Record<string, DatabaseUnserializedItemValue> = {};
        for(const key in body) {
            if(key !== "id" && body[key] !== undefined) {
                item[key] = body[key];
            }
        }

        return item;
    }
}

export default RouteEdit;
