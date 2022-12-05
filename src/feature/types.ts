import { BuiltinFeatureType } from "./built-in";

export type FeatureOptions = {
    id: string;
    name: string;
    type: BuiltinFeatureType;
};

export type FeatureServerOptions = FeatureOptions & {
    port: number;
    https: string;
    cors?: {
        origins: string[];
    };
    rateLimit?: boolean;
};