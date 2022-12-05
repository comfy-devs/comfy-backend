/* Types */
import { RootOptions } from "ts/backend/base";
/* Node Imports */
import { Worker } from "worker_threads";
import { existsSync, readFileSync } from "fs";

class Server {
    rootOptions: RootOptions;

    constructor() {
        if (!existsSync("config/root.json")) {
            throw new Error("The root config file is missing!");
        }

        this.rootOptions = JSON.parse(readFileSync("config/root.json", "utf-8"));
    }

    load() {
        const args = process.argv.slice(2);
        for(const arg of args) {
            switch (arg) {
                default:
                    break;
            }
        }
    }

    start() {
        for(const instanceID of this.rootOptions.instances) {
            const worker: Worker = new Worker("./build/instance/index.js", {
                workerData: {
                    id: instanceID,
                },
            });
        }
    }
}

const server: Server = new Server();
server.start();
