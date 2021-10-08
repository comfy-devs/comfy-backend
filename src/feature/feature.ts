/* Types */
import { InstanceFeatureConfig, StateDescriptor, Status } from "../ts/types";

abstract class InstanceFeature {
    id: string;
    state: StateDescriptor;
    config: InstanceFeatureConfig;

    constructor(config: InstanceFeatureConfig) {
        this.id = config.id;
        this.state = { status: Status.WAITING, message: "WAITING" };
        this.config = config;
    }

    abstract start(): Promise<void>;
}

export default InstanceFeature;
