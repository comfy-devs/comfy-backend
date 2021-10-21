/* Types */
import { RouteFetchOptions, DatabaseType, DatabaseFetchOptions, Status } from "../../ts/types";

/* Local Imports */
import Route from "../route";
import FeatureAPI from "../../feature/types/api";
import Database from "../../database/database";

class RouteFetch extends Route {
    options: RouteFetchOptions;

    constructor(options: RouteFetchOptions) {
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

        const database: Database = Array.from(feature.parent.databaseContainer.values()).filter(e => { return e.type === DatabaseType.MYSQL; })[0];
        feature.app.get(this.path, async (req, res) => {
            const options: DatabaseFetchOptions = { source: this.options.table, selectors: { id: req.params["id"] } };
            const item = await database.fetch(options);
            if (item === undefined) {
                res.sendStatus(404);
                return;
            }
            res.send(item);
        });
    }
}

export default RouteFetch;
