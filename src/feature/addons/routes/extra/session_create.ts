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
    Body: { username: string; password: string };
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
        if (
            Array.from(feature.parent.databaseContainer.values()).filter((e) => {
                return e.type === DatabaseType.REDIS;
            }).length === 0
        ) {
            this.state = { status: Status.ERROR, message: "NO_SESSION_DATABASE_FOUND" };
            return;
        }

        const database: Database = Array.from(feature.parent.databaseContainer.values()).filter((e) => {
            return e.type === DatabaseType.MYSQL;
        })[0];
        const sessionDatabase: Database = Array.from(feature.parent.databaseContainer.values()).filter((e) => {
            return e.type === DatabaseType.REDIS;
        })[0];
        feature.instance.post(this.path, async (req: Request, rep) => {
            const options: DatabaseFetchOptions = { source: "users", selectors: { username: req.body.username } };
            const user = await database.fetch(options);
            if (user === undefined) {
                rep.code(404);
                return;
            }
            if ((await compare(req.body.password, user.password)) === false) {
                rep.code(401);
                return;
            }

            const serverSession = {
                username: user.username,
            };
            const userSession = {
                token: randomBytes(16).toString("hex"),
            };
            rep.send(userSession);
        });
    }
}

export default RouteSessionCreate;
