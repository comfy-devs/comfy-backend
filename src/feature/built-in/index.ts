import Instance from "instance";
import Feature from "feature";
import { FeatureOptions } from "feature/types";
import FeatureStatic from "./static";
import FeatureAPI from "./api";
import { FeatureStaticOptions } from "./static/types";
import { FeatureAPIOptions } from "./api/types";

export enum BuiltinFeatureType {
    STATIC = "STATIC",
    API = "API"
}

const features: Record<BuiltinFeatureType, (parent: Instance, options: FeatureOptions) => Feature> = {
    [BuiltinFeatureType.STATIC]: (parent: Instance, options: FeatureOptions) => {return new FeatureStatic(parent, options as FeatureStaticOptions);},
    [BuiltinFeatureType.API]: (parent: Instance, options: FeatureOptions) => {return new FeatureAPI(parent, options as FeatureAPIOptions);}
}
export default features;