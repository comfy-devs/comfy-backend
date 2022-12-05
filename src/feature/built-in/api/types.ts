/* Types */
import { FeatureServerOptions } from "feature/types";
import { RouteOptions } from "./routes/types";

/* Options */
export type FeatureAPIOptions = FeatureServerOptions & {
    routes: RouteOptions[];
};
