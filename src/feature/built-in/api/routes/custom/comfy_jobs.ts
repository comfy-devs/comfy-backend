/* Types */
import { RouteOptions } from "../types";
import * as schemas from "./schemas";
import { RequestWithSchema } from "feature/built-in/api/routes/types";
/* Node Imports */
import { randomBytes } from "crypto";
/* Local Imports */
import APIRoute from "feature/built-in/api/routes";
import FeatureAPI from "feature/built-in/api";
import { validateSchemaBody } from "../util";

class RouteComfyJobs extends APIRoute {
    options: RouteOptions;

    constructor(feature: FeatureAPI, options: RouteOptions) {
        super(feature, options);
        this.options = options;
    }

    hook(feature: FeatureAPI): void {
        feature.instance.post(this.path,
            { config: { rateLimit: { timeWindow: 1000, max: 4 } } },
            async (req: RequestWithSchema<schemas.ComfyJobsSchemaType>, rep) => {
                /* Validate schemas */
                if(!validateSchemaBody(schemas.ComfyJobsSchema, req, rep)) {
                    return;
                }
                if(req.body.adminKey !== process.env.MIRACLE_ADMIN_KEY) { rep.code(403); rep.send(); return; }
                if(req.body.jobs.length > 0) {
                    await feature.database.delete({ source: "jobs", selectors: { server: req.body.server } });
                    req.body.jobs.forEach(job => {
                        const dbJob = {
                            id: randomBytes(16).toString("hex"),
                            server: req.body.server,
                            type: job.type,
                            name: job.name,
                            status: job.status,
                            progress: job.progress,
                            details: job.details
                        };
                        feature.database.add({ destination: "jobs", item: dbJob });
                    });
                }

                rep.code(200);
                rep.send();
            }
        );
    }
}

export default RouteComfyJobs;
