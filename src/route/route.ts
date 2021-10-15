/* Types */
import { RouteOptions } from "../ts/types";

abstract class APIRoute {
    path: string;

    constructor(options: RouteOptions) {
        this.path = options.path;
    }

    abstract hook(): Promise<void>;
}

export default APIRoute;
