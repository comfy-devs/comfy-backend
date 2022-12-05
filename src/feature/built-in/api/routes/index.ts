/* Types */
import { StateDescriptor, Status } from "ts/backend/base";
import { RouteOptions } from "./types";
/* Local Imports */
import FeatureAPI from "feature/built-in/api";

export default abstract class APIRoute {
    path: string;
    state: StateDescriptor;
    options: RouteOptions;

    constructor(feature: FeatureAPI, options: RouteOptions) {
        this.path = options.path;
        this.state = { status: Status.WAITING, message: "WAITING" };
        this.options = options;
    }

    abstract hook(feature: FeatureAPI): void | Promise<void>;
}