/* Types */
import { FeatureOptions } from "feature/types";

/* Options */
export type FeatureTrackerOptions = FeatureOptions & {
    port: number;
    https: string;
};