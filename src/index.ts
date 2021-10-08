/* Types */
import { ServerConfig, ServerInstanceConfig } from "./ts/types";

/* Node Imports */
import * as fs from "fs";
import { Worker } from "worker_threads";
import TSWorker from "ts-worker";
import { existsSync } from "fs";

class Server {
    config: ServerConfig;

    constructor() {
        if (!existsSync("build/configs/default.json")) {
            throw new Error("The default config file is missing!");
        }

        this.config = JSON.parse(fs.readFileSync("build/configs/default.json", "utf-8"));
    }

    load() {
        const args = process.argv.slice(2);
        args.forEach((arg, i) => {
            switch (arg) {
                case "--config":
                    if (!existsSync(args[i + 1])) {
                        throw new Error("The specified config file is missing!");
                    }

                    this.config = JSON.parse(fs.readFileSync(args[i + 1], "utf-8"));
                    break;
            }
        });
    }

    start() {
        this.config.instances.forEach((instanceConfig: ServerInstanceConfig) => {
            const worker: Worker = TSWorker("../instance/instance.ts", {
                workerData: {
                    config: instanceConfig,
                },
            });
        });
    }
}

const server: Server = new Server();
server.start();
