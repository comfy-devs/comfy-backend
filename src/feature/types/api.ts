/* Types */
import { Status } from "../../ts/types";
import InstanceFeature from "../feature";

/* Node Imports */
import express from "express";
import cors from "cors";
import { Server } from "http";

class InstanceAPIFeature extends InstanceFeature {
    async start(): Promise<void> {
        const app: express.Express = express();
        const corsCallback = {
            origin: (origin: any, callback: any) => {
                callback(null, this.config.options.allowedOrigins.indexOf(origin) !== -1);
            },
            credentials: true,
        };
        app.use(cors(corsCallback));

        const appServer: Server = app.listen(this.config.options.port);
        await new Promise((resolve) => {
            appServer.once("error", (e) => {
                this.state = { status: Status.ERROR, message: e.message };
                resolve(0);
            });
            appServer.once("listening", () => {
                resolve(0);
            });
        });
    }
}

export default InstanceAPIFeature;
