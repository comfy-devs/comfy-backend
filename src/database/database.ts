/* Types */
import { DatabaseOptions, StateDescriptor, Status, DatabaseFetchOptions } from "../ts/types";

abstract class Database {
    id: string;
    name: string;
    type: string;
    state: StateDescriptor;

    constructor(options: DatabaseOptions) {
        this.id = options.id;
        this.name = options.name;
        this.type = options.type;
        this.state = { status: Status.WAITING, message: "WAITING" };
    }

    abstract start(): Promise<void>;
    abstract validate(): Promise<void>;
    abstract fetch(options: DatabaseFetchOptions): Promise<any>;
}

export default Database;
