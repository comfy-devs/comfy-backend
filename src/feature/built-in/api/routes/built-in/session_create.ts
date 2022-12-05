/* Types */
import { DatabaseFetchOptions } from "database/types";
import { RouteSessionCreateOptions } from "./index";
import * as schemas from "./schemas";
import { RequestWithSchema } from "feature/built-in/api/routes/types";
import { Session, User } from "ts/backend/base";
/* Node Imports */
import { compare } from "bcrypt";
import { randomBytes } from "crypto";
/* Local Imports */
import APIRoute from "feature/built-in/api/routes";
import FeatureAPI from "feature/built-in/api";
import { validateSchemaBody } from "../util";

class RouteSessionCreate extends APIRoute {
    options: RouteSessionCreateOptions;

    constructor(feature: FeatureAPI, options: RouteSessionCreateOptions) {
        super(feature, options);
        this.options = options;
    }

    hook(feature: FeatureAPI): void {
        feature.instance.post(this.path,
            { config: { rateLimit: { timeWindow: 1000, max: 4 } } },
            async (req: RequestWithSchema<schemas.SessionCreateSchemaType>, rep) => {
                /* Validate schemas */
                if(!validateSchemaBody(schemas.SessionCreateSchema, req, rep)) {
                    return;
                }
                
                switch(req.body.type) {
                    case "token": {
                        /* Validate schema */
                        if(req.cookies.Token === undefined) { rep.code(403); rep.send(); return; }

                        /* Get session */
                        const options: DatabaseFetchOptions = { source: "sessions", selectors: { id: req.cookies.Token } };
                        const session = await feature.database.fetch<Session>(options);
                        if (session === null) {
                            rep.code(404); rep.send();
                            return;
                        }

                        /* Return session */
                        rep.send(session);
                        break;
                    }

                    case "classic": {
                        /* Validate schema */
                        if(req.body.username === undefined || req.body.password === undefined) { rep.code(400); rep.send(); return; }
                        
                        /* Get user */
                        const options: DatabaseFetchOptions = { source: "users", selectors: { username: req.body.username }, ignoreSensitive: true };
                        const user = await feature.database.fetch<User>(options);
                        if (user === null || user.password === undefined) {
                            rep.code(404); rep.send();
                            return;
                        }

                        /* Compare passwords */
                        if ((await compare(req.body.password, user.password.toString())) === false) {
                            rep.code(401);
                            rep.send();
                            return;
                        }

                        /* Create session */
                        const session: Session = {
                            id: randomBytes(16).toString("hex"),
                            user: user.id
                        };
                        feature.database.add({ destination: "sessions", item: session });
                        rep.cookie("Token", session.id, { path: "/", httpOnly: true, sameSite: "none", secure: true, maxAge: 604800000 });
                        rep.send(session);
                        break;
                    }

                    default: {
                        rep.code(400);
                        rep.send();
                        break;
                    }
                }
            }
        );
    }
}

export default RouteSessionCreate;
