/* Types */
import { Status } from "ts/backend/base";
import { FeatureStaticOptions } from "./types";
/* Node Imports */
import fastifyStatic from "@fastify/static";
import { existsSync, createReadStream } from "fs";
import { join } from "path";
import { RouteGenericInterface } from "fastify/types/route";
/* Local Imports */
import Feature from "feature";
import Instance from "instance";
import { createFastifyInstance, MiracleFastifyInstance, MiracleFastifyReply, MiracleFastifyRequest, startFastifyInstance } from "util/fastify";

class FeatureStatic extends Feature {
    options: FeatureStaticOptions;
    instance: MiracleFastifyInstance;

    constructor(parent: Instance, options: FeatureStaticOptions) {
        super(parent, options);
        this.options = options;
        this.instance = null as unknown as MiracleFastifyInstance;
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
        if(this.options.roots !== undefined) {
            for(const root of this.options.roots) {
                this.instance.get(root, (req: MiracleFastifyRequest<RouteGenericInterface>, rep: MiracleFastifyReply) => {
                    const stream = createReadStream(join(this.options.root, "index.html"));
                    rep.type("text/html").send(stream);
                });
            }
        }

        startFastifyInstance(this.instance, this.options);
    }
}

export default FeatureStatic;
