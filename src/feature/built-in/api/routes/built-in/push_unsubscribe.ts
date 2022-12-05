/* Types */
import { RoutePushUnsubscribeOptions } from "./index";
/* Local Imports */
import APIRoute from "feature/built-in/api/routes";
import FeatureAPI from "feature/built-in/api";
import { getSession } from "../util";

class RoutePushUnsubscribe extends APIRoute {
    options: RoutePushUnsubscribeOptions;

    constructor(feature: FeatureAPI, options: RoutePushUnsubscribeOptions) {
        super(feature, options);
        this.options = options;
    }

    hook(feature: FeatureAPI): void {
        feature.instance.post(this.path,
            { config: { rateLimit: { timeWindow: 1000, max: 4 } } },
            async (req, rep) => {
                /* Get session */
                const session = await getSession(feature.database, req, rep);
                if(session === null) {
                    return;
                }

                /* Unsubscribe from push notifications */
                const options = { destination: "users", selectors: { "id": session.user }, item: { pushEnabled: "0" } };
                feature.database.edit(options);

                rep.code(200);
                rep.send();
            }
        );
    }
}

export default RoutePushUnsubscribe;
