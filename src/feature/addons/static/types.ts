/* Types */
import { FeatureOptions, FeatureType } from "../../../ts/base";

/* Options */
export type FeatureStaticOptions = FeatureOptions & {
    type: FeatureType.STATIC;

    root: string;
    roots?: string[];
};
