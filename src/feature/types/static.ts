/* Types */
import { FeatureStaticOptions, Status } from "../../ts/types";

/* Node Imports */
import express from "express";
import cors from "cors";
import { Server } from "http";
import { existsSync } from "fs";

/* Local Imports */
import Feature from "../feature";
import Instance from "../../instance/instance";

class FeatureStatic extends Feature {
    options: FeatureStaticOptions;
    app: express.Express | undefined;
    appServer: Server | undefined;

    constructor(parent: Instance, options: FeatureStaticOptions) {
        super(parent, options);
        this.options = options;
    }

    async start(): Promise<void> {
        if (!existsSync(this.options.root)) {
            this.state = { status: Status.ERROR, message: "ROOT_NOT_FOUND" };
            return;
        }

        this.app = express();
        const corsCallback = {
            origin: (origin: any, callback: any) => {
                callback(null, this.options.allowedOrigins.indexOf(origin) !== -1);
            },
            credentials: true,
        };
        this.app.use(cors(corsCallback));
        this.app.use("/", express.static(this.options.root));

        this.appServer = this.app.listen(this.options.port);
        await new Promise((resolve) => {
            if (this.appServer === undefined) {
                resolve(0);
                return;
            }
            this.appServer.once("error", (e) => {
                this.state = { status: Status.ERROR, message: e.message };
                resolve(0);
            });
            this.appServer.once("listening", () => {
                resolve(0);
            });
        });
    }
}

export default FeatureStatic;
