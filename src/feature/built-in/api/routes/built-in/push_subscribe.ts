/* Types */
import { RoutePushSubscribeOptions } from "./index";
import * as schemas from "./schemas";
import { RequestWithSchema } from "feature/built-in/api/routes/types";
/* Local Imports */
import APIRoute from "feature/built-in/api/routes";
import FeatureAPI from "feature/built-in/api";
import { getSession, validateSchemaBody } from "feature/built-in/api/routes/util"

class RoutePushSubscribe extends APIRoute {
    options: RoutePushSubscribeOptions;

    constructor(feature: FeatureAPI, options: RoutePushSubscribeOptions) {
        super(feature, options);
        this.options = options;
    }

    hook(feature: FeatureAPI): void {
        feature.instance.post(this.path,
            { config: { rateLimit: { timeWindow: 1000, max: 4 } } },
            async (req: RequestWithSchema<schemas.PushSubscribeSchemaType>, rep) => {
                /* Validate schemas */
                if(!validateSchemaBody(schemas.PushSubscribeSchema, req, rep)) {
                    return;
                }

                /* Get session */
                const session = await getSession(feature.database, req, rep);
                if(session === null) {
                    return;
                }

                /* Subscribe to push notifications */
                const options = { destination: "users", selectors: { "id": session.user }, item: { pushEnabled: "1", pushUrl: req.body.url, pushKey: req.body.key, pushAuth: req.body.auth } };
                feature.database.edit(options);

                rep.code(200);
                rep.send();
            }
        );
    }
}

export default RoutePushSubscribe;
