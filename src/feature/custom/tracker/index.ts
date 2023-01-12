/* Types */
import { Status } from "ts/backend/base";
import { BuiltinDatabaseType } from "database/built-in";
import { FeatureTrackerOptions } from "./types";
/* Node Imports */
import { Server } from "bittorrent-tracker";
/* Local Imports */
import Feature from "feature";
import Instance from "instance";
import { readFileSync } from "fs";

class FeatureTracker extends Feature {
    options: FeatureTrackerOptions;

    constructor(parent: Instance, options: FeatureTrackerOptions) {
        super(parent, options);
        this.options = options;
    }

    async start(): Promise<void> {
        const database = this.parent.getDatabase(BuiltinDatabaseType.MYSQL);
        if (database === undefined) {
            this.state = { status: Status.ERROR, message: "NO_DATABASE_FOUND" };
            return;
        }

        const server = new Server({
            udp: false,
            http: {
                key: readFileSync(`config/https/${this.options.https}/privkey.pem`),
                cert: readFileSync(`config/https/${this.options.https}/fullchain.pem`)
            }
        });
        server.listen(this.options.port, "0.0.0.0");
        server.on("error", (e) => {
            console.log(e);
        });
        server.on("warning", (e) => {
            console.log(e);
        });
        server.on("listening", () => {
            console.log(`listening...`);
            console.log(server);
            
            // UDP
            /* const udpAddr = server.udp.address()
            const udpHost = udpAddr.address
            const udpPort = udpAddr.port
            console.log(`UDP tracker: udp://${udpHost}:${udpPort}`) */

            // WS
            const wsAddr = server.ws.address()
            const wsHost = wsAddr.address !== '::' ? wsAddr.address : 'localhost'
            const wsPort = wsAddr.port
            console.log(`WebSocket tracker: ws://${wsHost}:${wsPort}`)
        });
        server.on("start", (addr) => {
            console.log(`${addr} connected...`);
            console.log(server);
        });
        server.on("complete", (addr) => {
            console.log(`${addr} completed...`);
            console.log(server);
        });
        server.on("update", (addr) => {
            console.log(`${addr} updated...`);
            console.log(server);
        });
        server.on("stop", (addr) => {
            console.log(`${addr} disconnected...`);
            console.log(server);
        });
    }
}

export default FeatureTracker;
