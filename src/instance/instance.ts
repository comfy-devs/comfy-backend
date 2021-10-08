/* Types */
import { DatabaseType, FeatureType, ServerInstanceConfig, StateDescriptor, Status } from "../ts/types";

/* Node Imports */
import { workerData } from "worker_threads";
import { bold, green, red, yellow, gray } from "nanocolors";

/* Local Imports */
import InstanceDatabase from "../database/database";
import InstanceMySQLDatabase from "../database/types/mysql";
import InstanceFeature from "../feature/feature";
import InstanceStaticFeature from "../feature/types/static";
import InstanceAPIFeature from "../feature/types/api";

class ServerInstance {
    id: string;
    state: StateDescriptor;
    config: ServerInstanceConfig;

    databaseContainer: Map<string, InstanceDatabase>;
    featureContainer: Map<string, InstanceFeature>;

    constructor(config: ServerInstanceConfig) {
        this.id = config.id;
        this.state = { status: Status.WAITING, message: "WAITING" };
        this.config = config;

        this.databaseContainer = new Map();
        this.featureContainer = new Map();
    }

    load() {
        for (const databaseConfig of this.config.databases) {
            let database: InstanceDatabase;
            switch (databaseConfig.type) {
                case DatabaseType.MYSQL:
                    database = new InstanceMySQLDatabase(databaseConfig);
                    break;
            }

            this.databaseContainer.set(database.id, database);
        }

        for (const featureConfig of this.config.features) {
            let feature: InstanceFeature;
            switch (featureConfig.type) {
                case FeatureType.STATIC:
                    feature = new InstanceStaticFeature(featureConfig);
                    break;

                case FeatureType.API:
                    feature = new InstanceAPIFeature(featureConfig);
                    break;
            }

            this.featureContainer.set(feature.id, feature);
        }
    }

    async start(): Promise<void> {
        console.log(`[  ${gray("WAITING")}  ] Instance ${bold(yellow(this.config.name))} starting...`);

        for (const database of Array.from(this.databaseContainer.values())) {
            await database.start();
            if (database.state.status === Status.WAITING) {
                console.log(`${green(">")} Database ${bold(yellow(database.config.name))} started!`);
            } else {
                console.log(`${red(">")} Database ${bold(yellow(database.config.name))} failed to start! (ERROR: ${red(database.state.message)})`);
                this.fail(database.state);
                return;
            }

            await database.validate();
            if (database.state.status === Status.WAITING) {
                console.log(`${green(">")} Database ${bold(yellow(database.config.name))} validated!`);
            } else {
                console.log(`${red(">")} Database ${bold(yellow(database.config.name))} failed to validate! (ERROR: ${red(database.state.message)})`);
                this.fail(database.state);
                return;
            }

            database.state = { status: Status.SUCCESS, message: "SUCCESS" };
        }

        for (const feature of Array.from(this.featureContainer.values())) {
            await feature.start();
            if (feature.state.status === Status.WAITING) {
                console.log(`${green(">")} Feature ${bold(yellow(feature.config.name))} started!`);
            } else {
                console.log(`${red(">")} Feature ${bold(yellow(feature.config.name))} failed to start! (ERROR: ${red(feature.state.message)})`);
                this.fail(feature.state);
                return;
            }

            feature.state = { status: Status.SUCCESS, message: "SUCCESS" };
        }

        this.state = { status: Status.SUCCESS, message: "SUCCESS" };
        console.log(`[  ${green("OK")}  ] Instance ${bold(yellow(this.config.name))} started!`);
    }

    fail(errorStatus: StateDescriptor) {
        this.state = { status: Status.ERROR, message: errorStatus.message };
        console.log(`[  ${red("ERROR")}  ] Instance ${bold(yellow(this.config.name))} failed to start!`);
    }
}

const instance = new ServerInstance(workerData.config);
instance.load();
instance.start();
