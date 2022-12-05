/* Types */
import { FeatureServerOptions } from "feature/types";

/* Options */
export type FeatureStaticOptions = FeatureServerOptions & {
    root: string;
    roots?: string[];
};
