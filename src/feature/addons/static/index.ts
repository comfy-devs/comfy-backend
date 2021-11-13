/* Types */
import { Status } from "../../../ts/base";
import { FeatureStaticOptions } from "./types";

/* Node Imports */
import * as fastify from "fastify";
import fastifyStatic from "fastify-static";
import { existsSync } from "fs";

/* Local Imports */
import Feature from "../..";
import Instance from "../../../instance";
import { createFastifyInstance, startFastifyInstance } from "../../util";

class FeatureStatic extends Feature {
    options: FeatureStaticOptions;
    instance: fastify.FastifyInstance | null;

    constructor(parent: Instance, options: FeatureStaticOptions) {
        super(parent, options);
        this.options = options;
        this.instance = null;
    }

    async start(): Promise<void> {
        if (!existsSync(this.options.root)) {
            this.state = { status: Status.ERROR, message: "ROOT_NOT_FOUND" };
            return;
        }

        const result = await createFastifyInstance(this.options);
        if (result instanceof Error) {
            this.state = { status: Status.ERROR, message: result.message };
            return;
        }
        this.instance = result;

        this.instance.register(fastifyStatic, {
            root: this.options.root,
        });

        startFastifyInstance(this.instance, this.options);
    }
}

export default FeatureStatic;
