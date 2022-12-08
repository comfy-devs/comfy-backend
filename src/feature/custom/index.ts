import Instance from "instance";
import Feature from "feature";
import { FeatureOptions } from "feature/types";
import FeatureStats from "./stats";
import { FeatureStatsOptions } from "./stats/types";

export enum CustomFeatureType {
    STATS = "STATS"
}

const features: Record<CustomFeatureType, (parent: Instance, options: FeatureOptions) => Feature> = {
    [CustomFeatureType.STATS]: (parent: Instance, options: FeatureOptions) => {return new FeatureStats(parent, options as FeatureStatsOptions);},
}
export default features;