/* Types */
import { APIStructureOptions, InstanceOptions, StateDescriptor, Status } from "ts/backend/base";
/* Node Imports */
import { workerData } from "worker_threads";
import { bold, green, red, yellow, gray } from "nanocolors";
import { existsSync, readdirSync, readFileSync } from "fs";
/* Local Imports */
import Feature from "feature";
import Database from "database";
import BuiltinDatabases, { BuiltinDatabaseType } from "database/built-in";
import BuiltinFeatures, { BuiltinFeatureType } from "feature/built-in";

class Instance {
    id: string;
    state: StateDescriptor;
    options: InstanceOptions;

    databaseContainer: Map<string, Database>;
    featureContainer: Map<string, Feature>;
    structureContainer: Map<string, APIStructureOptions>;

    constructor(id: string) {
        this.id = id;
        this.state = { status: Status.WAITING, message: "WAITING" };
        this.options = JSON.parse(readFileSync(`config/instances/${id}/options.json`, "utf-8"));

        this.databaseContainer = new Map();
        this.featureContainer = new Map();
        this.structureContainer = new Map();
    }

    load(): void {
        for (const id of this.options.databases) {
            const options = JSON.parse(readFileSync(`config/databases/${id}/options.json`, "utf-8"));
            let database: Database | undefined;
            const builtinType = Object.values(BuiltinDatabaseType).find(e => e === (options.type as BuiltinDatabaseType));
            if(builtinType !== undefined) {
                database = BuiltinDatabases[builtinType](this, options);
            } else {
                this.state = { status: Status.ERROR, message: `${options.type} is not a valid database type` };
                return;
            }
            
            this.databaseContainer.set(database.id, database);
        }

        for (const id of this.options.features) {
            const options = JSON.parse(readFileSync(`config/features/${id}/options.json`, "utf-8"));
            let feature: Feature | undefined;
            const builtinType = Object.values(BuiltinFeatureType).find(e => e === (options.type as BuiltinFeatureType));
            if(builtinType !== undefined) {
                feature = BuiltinFeatures[builtinType](this, options);
            } else {
                this.state = { status: Status.ERROR, message: `${options.type} is not a valid feature type` };
                return;
            }

            this.featureContainer.set(feature.id, feature);
        }

        if(existsSync("config/structures")) {
            const structurePaths = readdirSync("config/structures");
            for (const structurePath of structurePaths) {
                const options = JSON.parse(readFileSync(`config/structures/${structurePath}`, "utf-8"));
                this.structureContainer.set(options.id, options);
            }
        }
    }

    async start(): Promise<void> {
        console.log(`[  ${gray("WAITING")}  ] Instance ${bold(yellow(this.options.name))} starting...`);

        for (const database of Array.from(this.databaseContainer.values())) {
            // eslint-disable-next-line no-await-in-loop
            await database.start();
            if (database.state.status === Status.WAITING) {
                console.log(`${green(">")} Database ${bold(yellow(database.name))} started!`);
            } else {
                console.log(`${red(">")} Database ${bold(yellow(database.name))} failed to start! (ERROR: ${red(database.state.message)})`);
                this.fail(database.state);
                return;
            }

            database.state = { status: Status.SUCCESS, message: "SUCCESS" };
        }

        for (const feature of Array.from(this.featureContainer.values())) {
            // eslint-disable-next-line no-await-in-loop
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

    getDatabase(type: BuiltinDatabaseType): Database | undefined {
        return Array.from(this.databaseContainer.values()).find((e) => e.type === type);
    }
}

export default Instance;

const instance = new Instance(workerData.id);
instance.load();
instance.start();
