/* Types */
import { InstanceDatabaseConfig, StateDescriptor, Status, DatabaseFetchOptions } from "../ts/types";

abstract class InstanceDatabase {
    id: string;
    state: StateDescriptor;
    config: InstanceDatabaseConfig;

    constructor(config: InstanceDatabaseConfig) {
        this.id = config.id;
        this.state = { status: Status.WAITING, message: "WAITING" };
        this.config = config;
    }

    abstract start(): Promise<void>;
    abstract validate(): Promise<void>;
    abstract fetch(options: DatabaseFetchOptions): Promise<any>;
}

export default InstanceDatabase;
