/* Types */
import { RouteOptions } from "../types";
import { RequestWithSchema } from "feature/built-in/api/routes/types";
/* Local Imports */
import APIRoute from "feature/built-in/api/routes";
import FeatureAPI from "feature/built-in/api";

class RouteNyanStats extends APIRoute {
    options: RouteOptions;

    constructor(feature: FeatureAPI, options: RouteOptions) {
        super(feature, options);
        this.options = options;
    }

    async hook(feature: FeatureAPI): Promise<void> {
        feature.instance.get(this.path,
            { config: { rateLimit: { timeWindow: 1000, max: 4 } } },
            async (req: RequestWithSchema<null>, rep) => {
                const stats: Stats = {
                    size: 0,
                    ammount: 0,
                };
                rep.send(stats);
            }
        );
    }
}

export default RouteNyanStats;
