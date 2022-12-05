/* Types */
import { DatabaseFetchOptions } from "database/types";
import { RouteSessionDeleteOptions } from "./index";
import { Session } from "ts/backend/base";
/* Local Imports */
import APIRoute from "feature/built-in/api/routes";
import FeatureAPI from "feature/built-in/api";

class RouteSessionDelete extends APIRoute {
    options: RouteSessionDeleteOptions;

    constructor(feature: FeatureAPI, options: RouteSessionDeleteOptions) {
        super(feature, options);
        this.options = options;
    }

    hook(feature: FeatureAPI): void {
        feature.instance.delete(this.path,
            { config: { rateLimit: { timeWindow: 1000, max: 4 } } },
            async (req, rep) => {
                /* If there is no token, it's already done */
                if(req.cookies.Token === undefined) { rep.code(200); rep.send(); return; }

                /* Clear session */
                const token = req.cookies.Token;
                rep.clearCookie("Token", { path: "/" });

                /* Get session */
                const options: DatabaseFetchOptions = { source: "sessions", selectors: { id: token } };
                const session = await feature.database.fetch<Session>(options);
                if (session === null) {
                    rep.code(404); rep.send();
                    return;
                }

                /* Delete session */
                await feature.database.delete(options);
                rep.code(200); rep.send();
            }
        );
    }
}

export default RouteSessionDelete;
