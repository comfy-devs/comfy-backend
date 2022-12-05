/* Types */
import { StateDescriptor, Status } from "ts/backend/base";
import { FeatureOptions } from "./types";
/* Local Imports */
import Instance from "instance";

export default abstract class Feature {
    parent: Instance;
    id: string;
    name: string;
    type: string;
    state: StateDescriptor;

    constructor(parent: Instance, options: FeatureOptions) {
        this.parent = parent;
        this.id = options.id;
        this.name = options.name;
        this.type = options.type;
        this.state = { status: Status.WAITING, message: "WAITING" };
    }

    abstract start(): Promise<void>;
}