/* Types */
import { RouteStatsOptions } from "../types";

/* Node Imports */
import { exec } from "child_process";

/* Local Imports */
import APIRoute from "..";
import FeatureAPI from "../../api";

class RouteStats extends APIRoute {
    options: RouteStatsOptions;

    constructor(options: RouteStatsOptions) {
        super(options);
        this.options = options;
    }

    async hook(feature: FeatureAPI): Promise<void> {
        if (feature.instance === null) {
            return;
        }

        feature.instance.get(this.path,
            { config: { rateLimit: { timeWindow: 1000, max: 10 } } },
            async (req, rep) => {
                const size_image: number = await new Promise((res, rej) => {
                    exec("du -sb /usr/src/image | cut -f1", (err, stdout, stderr) => { res(parseInt(stdout)); })
                });
                const size_video: number = await new Promise((res, rej) => {
                    exec("du -sb /usr/src/video | cut -f1", (err, stdout, stderr) => { res(parseInt(stdout)); })
                });
                const ammount_image: number = await new Promise((res, rej) => {
                    exec("du -sb --inodes /usr/src/image | cut -f1", (err, stdout, stderr) => { res(parseInt(stdout)); })
                });
                const ammount_video: number = await new Promise((res, rej) => {
                    exec("du -sb --inodes /usr/src/video | cut -f1", (err, stdout, stderr) => { res(parseInt(stdout)); })
                });

                rep.send({
                    size: size_image + size_video,
                    ammount: ammount_image + ammount_video
                });
            }
        );
    }
}

export default RouteStats;
