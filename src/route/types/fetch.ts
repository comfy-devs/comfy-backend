/* Types */
import { RouteFetchOptions } from "../../ts/types";

/* Local Imports */
import Route from "../route";

class RouteFetch extends Route {
    options: RouteFetchOptions;

    constructor(options: RouteFetchOptions) {
        super(options);
        this.options = options;
    }

    async hook(): Promise<void> {
        //
    }
}

export default RouteFetch;
