/* Types */
import { StateDescriptor, Status } from "ts/backend/base";
import * as types from "database/types";
/* Local Imports */
import Instance from "instance";

export default abstract class Database {
    parent: Instance;
    id: string;
    name: string;
    type: string;
    state: StateDescriptor;

    constructor(parent: Instance, options: types.DatabaseOptions) {
        this.parent = parent;
        this.id = options.id;
        this.name = options.name;
        this.type = options.type;
        this.state = { status: Status.WAITING, message: "WAITING" };
    }

    abstract start(): Promise<void>;
    abstract fetch<T>(options: types.DatabaseFetchOptions): Promise<T | null>;
    abstract fetchMultiple<T>(options: types.DatabaseFetchMultipleOptions): Promise<T[]>;
    abstract add(options: types.DatabaseAddOptions): Promise<void>;
    abstract edit(options: types.DatabaseEditOptions): Promise<void>;
    abstract delete(options: types.DatabaseDeleteOptions): Promise<number>;
}