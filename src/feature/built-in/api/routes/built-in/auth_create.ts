/* Types */
import { RouteAuthCreateOptions } from "feature/built-in/api/routes/built-in";
import { DatabaseFetchOptions } from "database/types";
import * as schemas from "./schemas";
import { RequestWithSchema } from "feature/built-in/api/routes/types";
import { User } from "ts/backend/base";
/* Node Imports */
import { hashSync } from "bcrypt";
import { randomBytes } from "crypto";
/* Local Imports */
import APIRoute from "feature/built-in/api/routes";
import FeatureAPI from "feature/built-in/api";
import { validateSchemaBody } from "feature/built-in/api/routes/util";

class RouteAuthCreate extends APIRoute {
    options: RouteAuthCreateOptions;

    constructor(feature: FeatureAPI, options: RouteAuthCreateOptions) {
        super(feature, options);
        this.options = options;
    }

    hook(feature: FeatureAPI): void {
        feature.instance.post(this.path,
            { config: { rateLimit: { timeWindow: 10000, max: 1 } } },
            async (req: RequestWithSchema<schemas.AuthCreateSchemaType>, rep) => {
                /* Validate schemas */
                if(!validateSchemaBody(schemas.AuthCreateSchema, req, rep)) {
                    return;
                }

                /* Check if another user exists under this name */
                const options: DatabaseFetchOptions = { source: "users", selectors: { username: req.body.username } };
                const user = await feature.database.fetch<User>(options);
                if (user !== null) {
                    rep.code(403); rep.send();
                    return;
                }

                /* Create user */
                const newUser: User = {
                    id: randomBytes(16).toString("hex"),
                    username: req.body.username,
                    password: hashSync(req.body.password, 10),
                    timestamp: Math.round(Date.now() / 1000)
                };
                feature.database.add({ destination: "users", item: newUser });
                delete newUser.password;
                rep.send(newUser);
            }
        );
    }
}

export default RouteAuthCreate;
