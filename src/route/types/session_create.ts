/* Types */
import { RouteSessionCreateOptions, DatabaseType, DatabaseFetchOptions, Status } from "../../ts/types";

/* Node Imports */
import { compare } from "bcrypt";
import { randomBytes } from "crypto";

/* Local Imports */
import Route from "../route";
import FeatureAPI from "../../feature/types/api";
import Database from "../../database/database";

class RouteSessionCreate extends Route {
    options: RouteSessionCreateOptions;

    constructor(options: RouteSessionCreateOptions) {
        super(options);
        this.options = options;
    }

    async hook(feature: FeatureAPI): Promise<void> {
        if (feature.app === undefined) {
            return;
        }
        if (Array.from(feature.parent.databaseContainer.values()).filter(e => { return e.type === DatabaseType.MYSQL; }).length === 0) {
            this.state = { status: Status.ERROR, message: "NO_DATABASE_FOUND" };
            return;
        }
        if (Array.from(feature.parent.databaseContainer.values()).filter(e => { return e.type === DatabaseType.REDIS; }).length === 0) {
            this.state = { status: Status.ERROR, message: "NO_SESSION_DATABASE_FOUND" };
            return;
        }

        const database: Database = Array.from(feature.parent.databaseContainer.values()).filter(e => { return e.type === DatabaseType.MYSQL; })[0];
        const sessionDatabase: Database = Array.from(feature.parent.databaseContainer.values()).filter(e => { return e.type === DatabaseType.REDIS; })[0];
        feature.app.post(this.path, async (req, res) => {
            const options: DatabaseFetchOptions = { source: "users", selectors: { username: req.body["username"] } };
            const user = await database.fetch(options);
            if (user === undefined) {
                res.sendStatus(404);
                return;
            }
            if(await compare(req.body["password"], user.password) === false) {
                res.sendStatus(401);
                return;
            }

            const serverSession = {
                username: user.username
            };
            const userSession = {
                token: randomBytes(16).toString("hex")
            };
            res.send(userSession);
        });
    }
}

export default RouteSessionCreate;
