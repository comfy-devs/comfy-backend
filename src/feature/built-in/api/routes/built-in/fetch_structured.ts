/* Types */
import { APIStructure, APIStructureImported, APIStructureImportedDetails, Session, Status } from "ts/backend/base";
import { BuiltinRouteType, RouteFetchStructuredOptions } from "./index";
import * as schemas from "./schemas";
import { IDSchema, IDSchemaType, RequestWithSchemaQuery } from "feature/built-in/api/routes/types";
/* Local Imports */
import APIRoute from "feature/built-in/api/routes";
import FeatureAPI from "feature/built-in/api";
import Database from "database";
import { getSession, validateSchemaQuery } from "feature/built-in/api/routes/util";
import { MiracleFastifyReply } from "util/fastify";
import RouteFetch from "./fetch";
import RouteFetchMultiple from "./fetch_multiple";

class RouteFetchStructured extends APIRoute {
    options: RouteFetchStructuredOptions;
    structure: APIStructureImported;
    details: APIStructureImportedDetails = { hasAuthorField: false, needsQueryId: false };

    constructor(feature: FeatureAPI, options: RouteFetchStructuredOptions) {
        super(feature, options);
        this.options = options;
        this.structure = {};

        if(this.options.base === undefined) {
            this.state = { status: Status.ERROR, message: "NO_BASE_FOUND" };
            return;
        }
        if(this.options.base.structure === undefined) {
            this.state = { status: Status.ERROR, message: "NO_BASE_STRUCTURE_FOUND" };
            return;
        }
        if(this.options.base.authorField !== undefined) {
           this.details.hasAuthorField = true; 
        }
        const structureTemp = this.validateStructure(feature, this.options.base.structure);
        if(structureTemp === null) {
            return;
        }
        this.structure = structureTemp;
    }

    validateStructure(feature: FeatureAPI, structure: APIStructure | string): APIStructureImported | null {
        let apiStructure: APIStructure | null = null;
        if(typeof(structure) === "object") {
            apiStructure = structure;
        } else {
            const structureTemp = feature.parent.structureContainer.get(structure);
            if(structureTemp === undefined) {
                this.state = { status: Status.ERROR, message: `NO_STRUCTURE_FOUND - ${structure}` };
                return null;
            }
            apiStructure = structureTemp.structure;
        }
        
        for (const [key, value] of Object.entries(apiStructure)) {
            if(value.authorField !== undefined) {
               this.details.hasAuthorField = true; 
            }
            if(value.baseIdField === undefined && (value.idField !== undefined || value.type === "SINGLE")) {
               this.details.needsQueryId = true;
            }
            if(value.structure === undefined) {
                continue;
            }
            const childStructure = this.validateStructure(feature, value.structure);
            if(childStructure === null) {
                return null;
            }
            apiStructure[key].structure = childStructure;
        }

        return apiStructure as APIStructureImported;
    }

    hook(feature: FeatureAPI): void {
        const routeOptions = { config: { rateLimit: { timeWindow: 1000, max: 10 } } };
        const paths = this.options.paths ?? { BASE: this.path };
        for(const [type, path] of Object.entries(paths)) {
            switch(type) {
                case "BASE": {
                    const baseRoute = new RouteFetch(feature, {
                        type: BuiltinRouteType.FETCH,
                        path, table: this.options.base.table, idField: this.options.base.idField, authorField: this.options.base.authorField,
                        select: this.options.base.select
                    });
                    baseRoute.hook(feature);
                    break;
                }

                case "BASE_ARRAY": {
                    const baseRoute = new RouteFetchMultiple(feature, {
                        type: BuiltinRouteType.FETCH_MULTIPLE,
                        path, table: this.options.base.table, idField: this.options.base.idField, authorField: this.options.base.authorField,
                        select: this.options.base.select
                    });
                    baseRoute.hook(feature);
                    break;
                }
                    
                case "SINGLE":
                    feature.instance.get(path, routeOptions, async (req: RequestWithSchemaQuery<IDSchemaType>, rep) => {
                        let { base, session } = await this.fetchBase(feature, "SINGLE", req, rep);
                        base = await this.decorateBase(feature.database, req, base, session, this.structure);
                        rep.send(base);
                    });
                    break;

                case "ARRAY":
                    feature.instance.get(path, routeOptions, async (req: RequestWithSchemaQuery<schemas.FetchStructuredArraySchemaType>, rep) => {
                        let { base, session } = await this.fetchBase(feature, "ARRAY", req, rep) ?? [];
                        const promises: Promise<any>[] = base.map((e: any) => this.decorateBase(feature.database, req, e, session, this.structure));
                        base = await Promise.all(promises);
                        rep.send(base);
                    });
                    break;
            }
        }
    }

    async fetchBase(feature: FeatureAPI, baseType: "SINGLE" | "ARRAY", req: RequestWithSchemaQuery<IDSchemaType | schemas.FetchStructuredArraySchemaType>, rep: MiracleFastifyReply): Promise<{ base: any, session: Session | null }> {
        /* Validate schemas */
        const needsId = baseType === "SINGLE" || this.details.needsQueryId;
        if(!validateSchemaQuery(needsId ? IDSchema : schemas.FetchStructuredArraySchema, req, rep)) {
            return { base: null, session: null };
        }
        
        /* If needed fetch session */
        let session: any;
        if(this.details.hasAuthorField) {
            session = await getSession(feature.database, req, rep);
            if(session === null) {
                rep.code(403); rep.send();
                return { base: null, session: session };
            }
        }

        /* Construct selectors */
        let base: any = {};
        const selectors: Record<string, string> = { ...this.options.base.select };
        if(this.options.base.idField !== undefined) {
            if(req.query.id === undefined) {
                rep.code(400); rep.send();
                return { base: null, session: session };
            }
            selectors[this.options.base.idField] = req.query.id;
        } else if(baseType === "SINGLE") {
            if(req.query.id === undefined) {
                rep.code(400); rep.send();
                return { base: null, session: session };
            }
            selectors.id = req.query.id;
        }

        /* Add a selector if route needs an author */
        if(this.options.base.authorField !== undefined) {
            selectors[this.options.base.authorField] = session.user;
        }

        /* Fetch */
        switch(baseType) {
            case "SINGLE":
                base = await feature.database.fetch({ source: this.options.base.table, selectors: selectors });
                if (base === null) {
                    rep.code(404); rep.send();
                    return { base: base, session: session };
                }
                break;

            case "ARRAY":
                base = await feature.database.fetchMultiple({ source: this.options.base.table, selectors: selectors });
                break;
        }

        return { base: base, session: session };
    }

    async decorateBase(database: Database, req: RequestWithSchemaQuery<IDSchemaType | schemas.FetchStructuredArraySchemaType>, base: any, session: Session | null, structure: APIStructureImported): Promise<any> {
        if(base === null) {
            return null;
        }
        
        const decoratorPromises: Promise<{ key: string, value: any }>[] = [];
        for (const [key, value] of Object.entries(structure)) {
            decoratorPromises.push(new Promise(async(resolve) => {
                /* Construct selectors */
                const selectors = { ...value.select };
                if(value.idField !== undefined) {
                    selectors[value.idField] = value.baseIdField === undefined ? req.query.id : base[value.baseIdField];
                } else if(value.type === "SINGLE") {
                    selectors.id = value.baseIdField === undefined ? req.query.id : base[value.baseIdField];
                }

                /* Add a selector if route needs an author */
                if(value.authorField !== undefined && session !== null) {
                    selectors[value.authorField] = session.user;
                }

                /* Fetch */
                let decorator: { key: string, value: any };
                switch(value.type) {
                    case "SINGLE":
                        const item = await database.fetch({ source: value.table, selectors: selectors });
                        decorator = { key, value: item };
                        break;

                    case "ARRAY":
                        const items = await database.fetchMultiple({ source: value.table, selectors: selectors, sort: value.sort, limit: value.limit });
                        decorator = { key, value: items };
                        break;
                }
                
                /* Construct rest of the structure */
                if(value.structure !== undefined) {
                    const decoratorStructure = value.structure;
                    if(Array.isArray(decorator.value)) {
                        const promises: Promise<any>[] = decorator.value.map((e: any) => this.decorateBase(database, req, e, session, decoratorStructure));
                        decorator.value = await Promise.all(promises);
                    } else {
                        decorator.value = await this.decorateBase(database, req, base, session, decoratorStructure);
                    }
                }

                resolve(decorator);
            }));
        }
        const decorators = await Promise.all(decoratorPromises);
        for(const decorator of decorators) {
            base[decorator.key] = decorator.value;
        }

        return base;
    }
}

export default RouteFetchStructured;
