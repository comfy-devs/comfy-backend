/* Types */
import { RouteCreateOptions } from ".";
import { DatabaseUnserializedItemValue } from "database/types";
import { RequestWithSchema } from "feature/built-in/api/routes/types";
import schemas from "ts/common/zod";
import { Session } from "ts/backend/base";
/* Node Imports */
import { randomBytes } from "crypto";
import { z } from "zod";
/* Local Imports */
import APIRoute from "feature/built-in/api/routes";
import FeatureAPI from "feature/built-in/api";
import { checkPrerequisites, getSession, validateSchemaBody } from "feature/built-in/api/routes/util"

class RouteCreate extends APIRoute {
    options: RouteCreateOptions;
    schema: z.Schema;

    constructor(feature: FeatureAPI, options: RouteCreateOptions) {
        super(feature, options);
        this.options = options;
        this.schema = schemas[this.options.schema];
    }

    hook(feature: FeatureAPI): void {
        feature.instance.post(this.path,
            { config: { rateLimit: { timeWindow: 3000, max: 1 } } },
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

                /* Create item */
                const item = this.createItem(session, req.body);
                feature.database.add({ destination: this.options.table, item });

                /* Send */
                rep.send(item);
            }
        );
    }

    createItem(session: Session, body: any): Record<string, DatabaseUnserializedItemValue> {
        console.log(body);
        const item: Record<string, DatabaseUnserializedItemValue> = {
            id: randomBytes(16).toString("hex"),
            author: session.user,
            ...this.options.defaults
        };
        for(const key in body) {
            item[key] = body[key] ?? null;
        }

        return item;
    }
}

export default RouteCreate;
