/* Types */
import { DatabaseType, DatabaseFetchOptions, Status } from "../../../../ts/base";
import { RouteSessionCreateOptions } from "../types";

/* Node Imports */
import { compare } from "bcrypt";
import { randomBytes } from "crypto";
import { FastifyRequest } from "fastify";

/* Local Imports */
import APIRoute from "..";
import FeatureAPI from "../../api";
import Database from "../../../../database";

type Request = FastifyRequest<{
    Querystring: { type: string, username?: string; password?: string };
}>;

class RouteSessionCreate extends APIRoute {
    options: RouteSessionCreateOptions;

    constructor(options: RouteSessionCreateOptions) {
        super(options);
        this.options = options;
    }

    async hook(feature: FeatureAPI): Promise<void> {
        if (feature.instance === null) {
            return;
        }
        if (
            Array.from(feature.parent.databaseContainer.values()).filter((e) => {
                return e.type === DatabaseType.MYSQL;
            }).length === 0
        ) {
            this.state = { status: Status.ERROR, message: "NO_DATABASE_FOUND" };
            return;
        }

        const database: Database = Array.from(feature.parent.databaseContainer.values()).filter((e) => {
            return e.type === DatabaseType.MYSQL;
        })[0];
        feature.instance.post(this.path,
            { config: { rateLimit: { timeWindow: 1000, max: 4 } } },
            async (req: Request, rep) => {
                switch(req.query.type) {
                    case "token": {
                        /* Validate schema */
                        if(req.cookies.Token === undefined) { rep.code(403); rep.send(); return; }

                        /* Check if session exists */
                        const options: DatabaseFetchOptions = { source: "sessions", selectors: { id: req.cookies.Token }, ignoreSensitive: true };
                        const session = await database.fetch(options);
                        if (session === undefined) {
                            rep.code(404);
                            rep.send();
                            return;
                        }

                        /* Return session */
                        rep.cookie("Token", session.id);
                        rep.send(session);
                        break;
                    }

                    case "classic": {
                        /* Validate schema */
                        if(req.query.username === undefined || req.query.password === undefined) { rep.code(400); rep.send(); return; }
                        
                        /* Check if user exists */
                        const options: DatabaseFetchOptions = { source: "users", selectors: { username: req.query.username }, ignoreSensitive: true };
                        const user = await database.fetch(options);
                        if (user === undefined) {
                            rep.code(404);
                            rep.send();
                            return;
                        }

                        /* Compare passwords */
                        if ((await compare(req.query.password, user.password)) === false) {
                            rep.code(401);
                            rep.send();
                            return;
                        }

                        /* Create session */
                        const session = {
                            id: randomBytes(16).toString("hex"),
                            user: user.id
                        };
                        database.add({ destination: "sessions", item: session });
                        rep.cookie("Token", session.id);
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
