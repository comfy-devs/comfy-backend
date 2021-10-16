/* Types */
import { RouteOptions, StateDescriptor, Status } from "../ts/types";

/* Local Imports */
import FeatureAPI from "../feature/types/api";

abstract class APIRoute {
    path: string;
    state: StateDescriptor;

    constructor(options: RouteOptions) {
        this.path = options.path;
        this.state = { status: Status.WAITING, message: "WAITING" };
    }

    abstract hook(feature: FeatureAPI): Promise<void>;
}

export default APIRoute;
