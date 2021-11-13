/* Types */
import { FeatureOptions, FeatureType } from "../../../ts/base";

/* Options */
export type FeatureAPIOptions = FeatureOptions & {
    type: FeatureType.API;

    routes: any[];
};
