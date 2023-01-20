/* Types */
import { Status } from "ts/backend/base";
import { BuiltinDatabaseType } from "database/built-in";
import { FeatureStatsOptions } from "./types";
/* Node Imports */
import fs from "fs";
import path from "path";
/* Local Imports */
import Feature from "feature";
import Instance from "instance";

function calculateStats(dirPath: string): { numFiles: number; totalSize: number } {
    let numFiles = 0;
    let totalSize = 0;
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            const { numFiles: dirNumFiles, totalSize: dirTotalSize } = calculateStats(filePath);
            numFiles += dirNumFiles;
            totalSize += dirTotalSize;
        } else if (stats.isFile()) {
            numFiles++;
            totalSize += stats.size;
        }
    }

    return { numFiles, totalSize };
}

class FeatureStats extends Feature {
    options: FeatureStatsOptions;

    constructor(parent: Instance, options: FeatureStatsOptions) {
        super(parent, options);
        this.options = options;
    }

    async start(): Promise<void> {
        const database = this.parent.getDatabase(BuiltinDatabaseType.MYSQL);
        if (database === undefined) {
            this.state = { status: Status.ERROR, message: "NO_DATABASE_FOUND" };
            return;
        }
        const calculate = async() => {
            const dirStats = this.options.roots.map(e => calculateStats(e)).reduce((acc, curr) => {
                acc.numFiles += curr.numFiles;
                acc.totalSize += curr.totalSize;
                return acc;
            }, { numFiles: 0, totalSize: 0 });
            const stats: Stats = {
                id: "default",
                files: dirStats.numFiles,
                size: dirStats.totalSize,
                users: await database.count({ source: "users", selectors: {} }),
                shows: await database.count({ source: "shows", selectors: {} }),
                episodes: await database.count({ source: "episodes", selectors: {} }),
                torrents: await database.count({ source: "torrents", selectors: {} })
            };
            
            database.edit({
                destination: "stats",
                item: stats,
                selectors: { id: stats.id }
            });
        }

        calculate();
        setInterval(calculate, 1000 * 60 * 5);
    }
}

export default FeatureStats;
