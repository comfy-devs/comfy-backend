/* Types */
import { RouteFetchOptions, DatabaseFetchOptions, Status } from "../../ts/types";

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
        if (feature.parent.databaseContainer.size === 0) {
            this.state = { status: Status.ERROR, message: "NO_DATABASE_FOUND" };
            return;
        }

        const database: Database = Array.from(feature.parent.databaseContainer.values())[0];
        feature.app.get(this.path, async (req, res) => {
            const options: DatabaseFetchOptions = { id: req.params["id"], table: this.options.table };
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
