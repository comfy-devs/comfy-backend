/* Types */
import { DatabaseType, FeatureType, InstanceOptions, StateDescriptor, Status } from "../ts/types";

/* Node Imports */
import { workerData } from "worker_threads";
import { bold, green, red, yellow, gray } from "nanocolors";

/* Local Imports */
import Database from "../database/database";
import DatabaseMySQL from "../database/types/mysql";
import DatabaseRedis from "../database/types/redis";
import Feature from "../feature/feature";
import FeatureStatic from "../feature/types/static";
import FeatureAPI from "../feature/types/api";

class Instance {
    id: string;
    state: StateDescriptor;
    options: InstanceOptions;

    databaseContainer: Map<string, Database>;
    featureContainer: Map<string, Feature>;

    constructor(options: InstanceOptions) {
        this.id = options.id;
        this.state = { status: Status.WAITING, message: "WAITING" };
        this.options = options;

        this.databaseContainer = new Map();
        this.featureContainer = new Map();
    }

    load(): void {
        for (const options of this.options.databases) {
            let database: Database | undefined;
            switch (options.type) {
                case DatabaseType.MYSQL:
                    database = new DatabaseMySQL(this, options);
                    break;

                case DatabaseType.REDIS:
                    database = new DatabaseRedis(this, options);
                    break;
            }

            if (database === undefined) {
                continue;
            }
            this.databaseContainer.set(database.id, database);
        }

        for (const options of this.options.features) {
            let feature: Feature | undefined;
            switch (options.type) {
                case FeatureType.STATIC:
                    feature = new FeatureStatic(this, options);
                    break;

                case FeatureType.API:
                    feature = new FeatureAPI(this, options);
                    break;
            }

            if (feature === undefined) {
                continue;
            }
            this.featureContainer.set(feature.id, feature);
        }
    }

    async start(): Promise<void> {
        console.log(`[  ${gray("WAITING")}  ] Instance ${bold(yellow(this.options.name))} starting...`);

        for (const database of Array.from(this.databaseContainer.values())) {
            await database.start();
            if (database.state.status === Status.WAITING) {
                console.log(`${green(">")} Database ${bold(yellow(database.name))} started!`);
            } else {
                console.log(`${red(">")} Database ${bold(yellow(database.name))} failed to start! (ERROR: ${red(database.state.message)})`);
                this.fail(database.state);
                return;
            }

            await database.validate();
            if (database.state.status === Status.WAITING) {
                console.log(`${green(">")} Database ${bold(yellow(database.name))} validated!`);
            } else {
                console.log(`${red(">")} Database ${bold(yellow(database.name))} failed to validate! (ERROR: ${red(database.state.message)})`);
                this.fail(database.state);
                return;
            }

            database.state = { status: Status.SUCCESS, message: "SUCCESS" };
        }

        for (const feature of Array.from(this.featureContainer.values())) {
            await feature.start();
            if (feature.state.status === Status.WAITING) {
                console.log(`${green(">")} Feature ${bold(yellow(feature.name))} started!`);
            } else {
                console.log(`${red(">")} Feature ${bold(yellow(feature.name))} failed to start! (ERROR: ${red(feature.state.message)})`);
                this.fail(feature.state);
                return;
            }

            feature.state = { status: Status.SUCCESS, message: "SUCCESS" };
        }

        this.state = { status: Status.SUCCESS, message: "SUCCESS" };
        console.log(`[  ${green("OK")}  ] Instance ${bold(yellow(this.options.name))} started!`);
    }

    fail(errorStatus: StateDescriptor): void {
        this.state = { status: Status.ERROR, message: errorStatus.message };
        console.log(`[  ${red("ERROR")}  ] Instance ${bold(yellow(this.options.name))} failed to start!`);
    }
}

export default Instance;

const instance = new Instance(workerData.options);
instance.load();
instance.start();
