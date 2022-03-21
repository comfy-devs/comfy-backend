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
    Querystring: { id: string, start?: number, end?: number };
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
        feature.instance.get(this.path,
            { config: { rateLimit: { timeWindow: 1000, max: 10 } } },
            async (req: Request, rep) => {
                /* Validate schema */
                if(!this.options.disableSelectors && req.query.id === undefined) { rep.code(400); rep.send(); return; }

                /* Fetch */
                const selectors = this.options.disableSelectors ? {} : { [this.options.idField === undefined ? "id": this.options.idField]: req.query.id };
                const options: DatabaseFetchOptions = { source: this.options.table, selectors: selectors };
                let items = await database.fetchMultiple(options);

                /* Check if user is permitted to access */
                if(this.options.authorField !== undefined) {
                    if(req.cookies.Token === undefined) { rep.code(403); rep.send(); return; }
                    const session = await database.fetch({ source: "sessions", selectors: { "id": req.cookies.Token } });
                    if(session === undefined) { rep.code(403); rep.send(); return; }
                    items = items.filter(e => {
                        if(this.options.authorField === undefined) { return; }
                        return e[this.options.authorField] === session.user;
                    });
                }

                /* Apply pagination */
                if(req.query.start !== undefined || req.query.end !== undefined) {
                    const start = req.query.start ?? 0;
                    const end = req.query.end ?? items.length;
                    if(start < 0) { rep.code(400); rep.send(); return; }
                    if(end < 0) { rep.code(400); rep.send(); return; }
                    if(end < start) { rep.code(400); rep.send(); return; }
                    items = items.slice(start, end);
                }

                rep.send(items);
            }
        );
    }
}

export default RouteFetchMultiple;
