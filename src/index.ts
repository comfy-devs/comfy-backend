/* Types */
import { Config, InstanceOptions } from "./ts/types";

/* Node Imports */
import * as fs from "fs";
import { Worker } from "worker_threads";
import { existsSync } from "fs";

class Server {
    config: Config;

    constructor() {
        if (!existsSync("configs/configs/default.json")) {
            throw new Error("The default config file is missing!");
        }

        this.config = JSON.parse(fs.readFileSync("configs/configs/default.json", "utf-8"));
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
        this.config.instances.forEach((instanceOptions: InstanceOptions) => {
            const worker: Worker = new Worker("./build/instance/instance.js", {
                workerData: {
                    options: instanceOptions,
                },
            });
        });
    }
}

const server: Server = new Server();
server.start();
