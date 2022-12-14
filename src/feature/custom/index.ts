import Instance from "instance";
import Feature from "feature";
import { FeatureOptions } from "feature/types";
import FeatureStats from "./stats";
import { FeatureStatsOptions } from "./stats/types";
import FeatureTracker from "./tracker";
import { FeatureTrackerOptions } from "./tracker/types";

export enum CustomFeatureType {
    STATS = "STATS",
    TRACKER = "TRACKER"
}

const features: Record<CustomFeatureType, (parent: Instance, options: FeatureOptions) => Feature> = {
    [CustomFeatureType.STATS]: (parent: Instance, options: FeatureOptions) => {return new FeatureStats(parent, options as FeatureStatsOptions);},
    [CustomFeatureType.TRACKER]: (parent: Instance, options: FeatureOptions) => {return new FeatureTracker(parent, options as FeatureTrackerOptions);},
}
export default features;