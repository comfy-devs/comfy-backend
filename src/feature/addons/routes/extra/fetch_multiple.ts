/* Types */
import { DatabaseType, DatabaseFetchOptions, Status } from "../../../../ts/base";
import { RouteFetchMultipleOptions } from "../types";

/* Node Imports */
import { FastifyRequest } from "fastify";

/* Local Imports */
import APIRoute from "..";
import FeatureAPI from "../../api";
import Database from "../../../../database";

type Request = FastifyRequest<{
    Querystring: { id: string };
}>;

class RouteFetchMultiple extends APIRoute {
    options: RouteFetchMultipleOptions;

    constructor(options: RouteFetchMultipleOptions) {
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
        feature.instance.get(this.path, async (req: Request, rep) => {
            const selectors = this.options.disableSelectors ? {} : { [this.options.idField === undefined ? "id": this.options.idField]: req.query.id };
            const options: DatabaseFetchOptions = { source: this.options.table, selectors: selectors };
            const items = await database.fetchMultiple(options);
            rep.send(items);
        });
    }
}

export default RouteFetchMultiple;
