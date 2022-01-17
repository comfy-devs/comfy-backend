/* Types */
import { DatabaseType, DatabaseFetchOptions, Status } from "../../../../ts/base";
import { RouteAuthCreateOptions } from "../types";

/* Node Imports */
import { hashSync } from "bcrypt";
import { randomBytes } from "crypto";
import { FastifyRequest } from "fastify";

/* Local Imports */
import APIRoute from "..";
import FeatureAPI from "../../api";
import Database from "../../../../database";

type Request = FastifyRequest<{
    Querystring: { username: string; password: string };
}>;

class RouteAuthCreate extends APIRoute {
    options: RouteAuthCreateOptions;

    constructor(options: RouteAuthCreateOptions) {
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
            { config: { rateLimit: { timeWindow: 300000, max: 1 } } },
            async (req: Request, rep) => {
                /* Validate schema */
                if(req.query.username === undefined || req.query.password === undefined) { rep.code(400); rep.send(); return; }
                if(req.query.username.length < 3 || req.query.password.length < 8) { rep.code(403); rep.send(); return; }

                /* Check if another user exists under this name */
                const options: DatabaseFetchOptions = { source: "users", selectors: { username: req.query.username } };
                const user = await database.fetch(options);
                if (user !== undefined) {
                    rep.code(403);
                    rep.send();
                    return;
                }

                /* Create user */
                const newUser: any = {
                    id: randomBytes(16).toString("hex"),
                    username: req.query.username,
                    password: hashSync(req.query.password, 10)
                };
                database.add({ destination: "users", item: newUser });
                delete newUser.password;
                rep.send(newUser);
            }
        );
    }
}

export default RouteAuthCreate;
