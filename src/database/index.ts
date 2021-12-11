/* Types */
import { DatabaseOptions, StateDescriptor, Status, DatabaseFetchOptions } from "../ts/base";

/* Local Imports */
import Instance from "../instance";

abstract class Database {
    parent: Instance;
    id: string;
    name: string;
    type: string;
    state: StateDescriptor;

    constructor(parent: Instance, options: DatabaseOptions) {
        this.parent = parent;
        this.id = options.id;
        this.name = options.name;
        this.type = options.type;
        this.state = { status: Status.WAITING, message: "WAITING" };
    }

    abstract start(): Promise<void>;
    abstract fetch(options: DatabaseFetchOptions): Promise<any>;
    abstract fetchMultiple(options: DatabaseFetchOptions): Promise<any[]>;
}

export default Database;
