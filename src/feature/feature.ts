/* Types */
import { FeatureOptions, StateDescriptor, Status } from "../ts/types";

abstract class Feature {
    id: string;
    name: string;
    type: string;
    state: StateDescriptor;

    constructor(options: FeatureOptions) {
        this.id = options.id;
        this.name = options.name;
        this.type = options.type;
        this.state = { status: Status.WAITING, message: "WAITING" };
    }

    abstract start(): Promise<void>;
}

export default Feature;
