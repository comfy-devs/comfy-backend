/* Types */
import { RouteOptions } from "../types";
import APIRoute from "feature/built-in/api/routes";
import FeatureAPI from "feature/built-in/api";
/* Local Imports */
import RouteUserDelete from "./user_delete";
import RouteComfyFavourite from "./comfy_favourite";
import RouteComfyJobs from "./comfy_jobs";

export enum CustomRouteType {
    USER_DELETE = "USER_DELETE",
    COMFY_FAVOURITE = "COMFY_FAVOURITE",
    COMFY_JOBS = "COMFY_JOBS"
};

const routes: Record<CustomRouteType, (feature: FeatureAPI, options: RouteOptions) => APIRoute> = {
    [CustomRouteType.USER_DELETE]: (feature: FeatureAPI, options: RouteOptions) => {return new RouteUserDelete(feature, options);},
    [CustomRouteType.COMFY_FAVOURITE]: (feature: FeatureAPI, options: RouteOptions) => {return new RouteComfyFavourite(feature, options);},
    [CustomRouteType.COMFY_JOBS]: (feature: FeatureAPI, options: RouteOptions) => {return new RouteComfyJobs(feature, options);}
}
export default routes;