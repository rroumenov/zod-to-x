import {
    ZodAny,
    ZodArray,
    ZodBigInt,
    ZodBoolean,
    ZodDate,
    ZodDefault,
    ZodDiscriminatedUnion,
    ZodEnum,
    ZodFirstPartyTypeKind,
    ZodIntersection,
    ZodLazy,
    ZodLiteral,
    ZodMap,
    ZodNativeEnum,
    ZodNullable,
    ZodNumber,
    ZodNumberCheck,
    ZodObject,
    ZodOptional,
    ZodRawShape,
    ZodRecord,
    ZodSet,
    ZodString,
    ZodTuple,
    ZodTypeAny,
    ZodUnion,
} from "zod";

import { IZod2xLayerMetadata, IZod2xMetadata } from "@/lib/zod_ext";
import { log } from "@/utils/logger";

import {
    ASTCommon,
    ASTDefintion,
    ASTNode,
    ASTNodes,
    ASTObject,
    ASTUnion,
    TranspilerableTypes,
} from "./ast_types";
import { AstNodeError, AstTypeNameDefinitionError, BadLayerDefinitionError } from "./errors";

export interface IZod2AstOpt {
    /**
     * When true, it will throw an error if a bad data modeling practice is detected.
     * Default is true.
     */
    strict?: boolean;

    /**
     * Metadata used to provide additional information to the AST nodes about layers modeling of
     * the schema.
     */
    layer?: IZod2xLayerMetadata;
}

interface ISchemasMetadata {
    /**
     * Indicates when a ZodEnum is passed as ZodLiteral option.
     */
    isInjectedEnum?: boolean;

    /**
     * The key used in ZodDiscriminatedUnion type.
     */
    discriminantKey?: string;
}

/**
 * This class creates AST nodes used to transpile Zod Schemas to other languages.
 * Simply create an instance and call build with a ZodObject to obtain a list with transpilerable
 * nodes.
 */
export class Zod2Ast {
    /**
     * Transpilerable nodes of current data model
     */
    private nodes: Map<string, TranspilerableTypes>;

    /**
     * Lazy schemas for further analysis
     */
    private lazyPointers: Array<[ASTDefintion, ZodTypeAny]>;

    /**
     * Warnings generated during the AST creation to aware user about bad practices
     */
    private warnings: string[];

    private opt: IZod2AstOpt;

    constructor(opt: IZod2AstOpt = {}) {
        this.nodes = new Map<string, TranspilerableTypes>();
        this.lazyPointers = [];
        this.warnings = [];

        this.opt = {
            ...opt,
            strict: opt.strict ?? true,
        };
    }

    /**
     * Check if the layer of the item is compatible with the layer of the schema. If does and the
     * transpilerable item is in a different file, it returns the file name.
     *
     * @param itemName
     * @param layerMetadata
     * @returns
     */
    private _getTranspilerableFile(
        itemName: string,
        metadata?: IZod2xMetadata
    ): { parentFile?: string; parentNamespace?: string; parentTypeName?: string } {
        let layer: IZod2xLayerMetadata;

        if (this.opt.layer !== undefined && metadata?.layer !== undefined) {
            if (metadata.layer.file === this.opt.layer.file) {
                // Case 1: Only layer exists and belongs to the same file
                // Case 2: Layer (belongs to same file) and parentLayer exist
                // Behaviour: New type is created extending the parent layer (if any)
                layer = metadata.parentLayer ?? metadata.layer;

                if (this.opt.layer.index < layer.index) {
                    throw new BadLayerDefinitionError(
                        `${itemName}: Layer with number ${this.opt.layer.index} can only use models` +
                            `from the same or lower layer. Found layer with number ${layer.index}`
                    );
                }

                if (this.opt.layer.file !== layer.file) {
                    return {
                        parentFile: layer.file,
                        parentNamespace: layer.namespace,
                        parentTypeName: metadata?.parentTypeName,
                    };
                }
            } else {
                // Case 3: Only layer exists and belongs to a different file
                // Case 4: Layer (belongs to different file) and parentLayer exist
                // Behaviour: Type is imported from Layer file
                layer = metadata.layer;

                if (this.opt.layer.index < layer.index) {
                    throw new BadLayerDefinitionError(
                        `${itemName}: Layer with number ${this.opt.layer.index} can only use models` +
                            `from the same or lower layer. Found layer with number ${layer.index}`
                    );
                }

                return {
                    parentFile: layer.file,
                    parentNamespace: layer.namespace,
                    parentTypeName: undefined,
                };
            }
        }

        return {};
    }

    /**
     * Transpilerable items are treated as references in the AST
     * @param ref - Output type name
     * @param refType - Type of the output type
     * @param discriminantValue - Discriminant value (for ZodDiscriminatedUnion)
     * @param parentNamespace - For Layered modeling, the namespace of the parent type if does not
     *                          belong to the same file.
     * @param parentFile - For Layered modeling, the file of the parent type if does not belong to
     *                      the same file.
     * @returns
     */
    private _createDefinition(
        ref: string,
        refType: ZodFirstPartyTypeKind,
        discriminantValue?: string,
        parentNamespace?: string,
        parentFile?: string
    ): ASTDefintion {
        return {
            type: "definition",
            reference: ref,
            referenceType: refType,
            discriminantValue,
            parentNamespace,
            parentFile,
        };
    }

    /**
     * Extracts and formats the enumeration values from a given ZodEnum or ZodNativeEnum schema.
     * @param schema - A ZodEnum or ZodNativeEnum schema containing the enumeration values.
     * @returns A list of key-value pairs where the key is a formatted string and the value
     *          is either a string or a number.
     */
    private _getEnumValues(schema: ZodEnum<any> | ZodNativeEnum): [string, string | number][] {
        if (schema instanceof ZodEnum) {
            return Object.entries(schema.Enum).map(([key, value]) => {
                // Creates a string key if it starts with number.
                key = isNaN(Number(key.at(0))) ? key : `"${key}"`;
                return [key, value] as [string, string | number];
            });
        } else {
            return Object.entries(schema.enum)
                .filter(([key, _value]) => isNaN(Number(key)))
                .map(([key, value]) => {
                    // Creates a string key if it starts with number.
                    key = isNaN(Number(key.at(0))) ? key : `"${key}"`;
                    return [key, value] as [string, string | number];
                });
        }
    }

    /**
     * Intersects the properties of two AST nodes and returns the combined properties.
     *
     * @param left - The left AST definition to intersect.
     * @param right - The right AST definition to intersect.
     * @returns An object containing the combined properties of the left and right AST nodes.
     */
    private _intersectAstNodes(
        left: ASTDefintion,
        right: ASTDefintion
    ): Pick<ASTObject, "properties"> {
        const leftData = this.nodes.get(left.reference) as ASTCommon & ASTObject;
        const rightData = this.nodes.get(right.reference) as ASTCommon & ASTObject;

        return {
            properties: {
                ...leftData.properties,
                ...rightData.properties,
            },
        };
    }

    /**
     * Merges multiple AST definitions into a single AST object containing combined properties.
     * - Equal properties mush have the same type and array dimension.
     * - If a property is optional in one definition and required in another, it will be considered
     *      optional in the merged object.
     * - If a property is nullable in one definition and non-nullable in another, it will be
     *      considered nullable in the merged object.
     *
     * @param options - An array of AST definitions to be merged.
     * @returns An object containing the merged properties.
     * @throws AstNodeError - If properties with different types or array dimensions are encountered.
     */
    private _unionAstNodes(options: ASTDefintion[]): Pick<ASTObject, "properties"> {
        const data = options.map((i) => this.nodes.get(i.reference) as ASTCommon & ASTObject);
        return {
            properties: data.reduce((acc: Record<string, ASTNode>, i, j) => {
                for (const key in i.properties) {
                    if (acc[key]) {
                        acc[key] = structuredClone(acc[key]);

                        if (acc[key].type !== i.properties[key].type) {
                            this.warnings.push(
                                `Merging properties with different types: ${acc[key].type} ` +
                                    `(from ${data[j - 1]?.name}) and ${i.properties[key].type} ` +
                                    `(from ${i.name})`
                            );

                            acc[key].type = i.properties[key].type;
                        }

                        if (acc[key].arrayDimension !== i.properties[key].arrayDimension) {
                            this.warnings.push(
                                `Merging properties with different array dimensions: ` +
                                    `${acc[key].arrayDimension} (from ${data[j - 1]?.name}) and ` +
                                    `${i.properties[key].arrayDimension} (from ${i.name})`
                            );

                            acc[key].arrayDimension = Math.max(
                                acc[key].arrayDimension || 0,
                                i.properties[key].arrayDimension || 0
                            );
                        }

                        if (acc[key].isNullable !== i.properties[key].isNullable) {
                            acc[key].isNullable = true;
                        }

                        if (acc[key].isOptional !== i.properties[key].isOptional) {
                            acc[key].isOptional = true;
                        }

                        if (i.properties[key].description) {
                            acc[key].description = i.properties[key].description;
                        }
                    } else {
                        acc[key] = i.properties[key];
                    }
                }

                return acc;
            }, {}),
        };
    }

    private _getNames(schema: ZodTypeAny, errorString: string) {
        const name = schema._zod2x?.typeName;

        if (!name) {
            throw new AstTypeNameDefinitionError(errorString);
        }

        return {
            name,
            zodTypeName: schema._def.typeName,
            ...this._getTranspilerableFile(name, schema._zod2x),
        };
    }

    private _getEnumAst(
        schema: ZodEnum<any> | ZodNativeEnum,
        opt?: ISchemasMetadata
    ): ASTDefintion {
        const { name, zodTypeName, parentFile, parentNamespace, parentTypeName } = this._getNames(
            schema,
            "ZodEnum/ZodNativeEnum type must have a typeName. Use zod2x method to provide one."
        );

        const item: TranspilerableTypes = {
            type: zodTypeName,
            name,
            values: this._getEnumValues(schema),
            description: schema._def.description,
            parentFile,
            parentNamespace,
            parentTypeName,
            isFromDiscriminatedUnion: opt?.isInjectedEnum,
        };

        if (!this.nodes.has(name)) {
            this.nodes.set(name, item);
        }

        return this._createDefinition(name, zodTypeName, undefined, parentNamespace, parentFile);
    }

    private _getObjectAst(schema: ZodObject<any>, opt?: ISchemasMetadata): ASTDefintion {
        const { name, zodTypeName, parentFile, parentNamespace, parentTypeName } = this._getNames(
            schema,
            "ZodObject type must have a typeName. Use zod2x method to provide one."
        );

        let discriminantValue: string | undefined = undefined;
        const shape = schema._def.shape();

        if (!this.nodes.has(name)) {
            const properties: Record<string, ASTNode> = {};
            for (const key in shape) {
                properties[key] = this._zodToAST(shape[key]);
            }

            this.nodes.set(name, {
                type: ZodFirstPartyTypeKind.ZodObject,
                name,
                properties,
                description: schema.description,
                parentFile,
                parentNamespace,
                parentTypeName,
            });
        }

        if (opt?.discriminantKey) {
            const item = this.nodes.get(name) as ASTObject;

            if (Object.keys(item.properties).includes(opt.discriminantKey)) {
                const key = opt.discriminantKey;
                if (item.properties[key].type === ZodFirstPartyTypeKind.ZodLiteral) {
                    /* Used for serialization purposes, it is parsed as string for
                     * convenience */
                    discriminantValue = String(item.properties[key].value);
                } else {
                    console.warn(`Consider to set '${key}' key of '${name}' as ZodLiteral`);
                }
            }
        }

        return this._createDefinition(
            name,
            zodTypeName,
            discriminantValue,
            parentTypeName ? undefined : parentNamespace,
            parentTypeName ? undefined : parentFile
        );
    }

    private _getUnionAst(schema: ZodUnion<any> | ZodDiscriminatedUnion<string, any>): ASTDefintion {
        const def = schema._def;
        const discriminator =
            schema instanceof ZodDiscriminatedUnion ? schema._def.discriminator : undefined;

        const { name, zodTypeName, parentFile, parentNamespace, parentTypeName } = this._getNames(
            schema,
            "ZodUnion/ZodDiscriminatedUnion type must have a typeName. " +
                "Use zod2x method to provide one."
        );

        const item: TranspilerableTypes = {
            type: zodTypeName,
            name,
            options: def.options.map((i: ZodTypeAny) =>
                this._zodToAST(i, { discriminantKey: discriminator })
            ),
            description: schema.description,
            discriminantKey: discriminator,
            parentFile,
            parentNamespace,
            parentTypeName,
        };

        if (!def.options.every((i: ZodTypeAny) => i instanceof ZodObject)) {
            this.warnings.push(
                "Union of non-object types is a bad data modeling practice, " +
                    "and could lead to unexpected results."
            );
        } else if (schema instanceof ZodUnion) {
            this.warnings.push(
                "Using ZodUnion is a bad data modeling practice. " +
                    "Use ZodDiscriminatedUnion instead."
            );

            (item as unknown as ASTCommon & ASTUnion).newObject = {
                name,
                type: ZodFirstPartyTypeKind.ZodObject,
                properties: this._unionAstNodes(item.options as ASTDefintion[]).properties,
                description:
                    (schema.description ? `${schema.description} - ` : "") +
                    `Built from union of ` +
                    `${item.options.map((i) => (i as ASTDefintion).reference).join(", ")}`,
            };
        }

        if (name && !this.nodes.has(name)) {
            this.nodes.set(name, item);
        }

        return this._createDefinition(
            name,
            zodTypeName,
            undefined,
            parentTypeName ? undefined : parentNamespace,
            parentTypeName ? undefined : parentFile
        );
    }

    private _getIntersectionAst(schema: ZodIntersection<ZodTypeAny, ZodTypeAny>): ASTDefintion {
        const def = schema._def;
        const { name, zodTypeName, parentFile, parentNamespace, parentTypeName } = this._getNames(
            schema,
            "ZodIntersection type must have a typeName. Use zod2x method to provide one."
        );

        const item: TranspilerableTypes = {
            type: ZodFirstPartyTypeKind.ZodIntersection,
            name,
            left: this._zodToAST(def.left),
            right: this._zodToAST(def.right),
            description: schema.description,
            parentFile,
            parentNamespace,
            parentTypeName,
        };

        if (def.left._def.typeName !== "ZodObject" || def.right._def.typeName !== "ZodObject") {
            this.warnings.push(
                "Intersection of non-object is a bad data modeling practice, " +
                    "and could lead to unexpected results."
            );
        } else {
            item.newObject = {
                type: ZodFirstPartyTypeKind.ZodObject,
                name,
                properties: this._intersectAstNodes(
                    item.left as ASTDefintion,
                    item.right as ASTDefintion
                ).properties,
                description:
                    (schema.description ? `${schema.description} - ` : "") +
                    `Built from intersection of ` +
                    `${(item.left as ASTDefintion).reference} and ` +
                    `${(item.right as ASTDefintion).reference}`,
            };
        }

        if (name && !this.nodes.has(name)) {
            this.nodes.set(name, item);
        }

        return this._createDefinition(
            name,
            zodTypeName,
            undefined,
            parentTypeName ? undefined : parentNamespace,
            parentTypeName ? undefined : parentFile
        );
    }

    /**
     * Build the AST node of provided Zod Schema
     * @param schema
     * @returns
     */
    private _zodToAST(schema: ZodTypeAny, opt?: ISchemasMetadata): ASTNode {
        const def = schema._def;

        if (schema instanceof ZodString) {
            return {
                type: ZodFirstPartyTypeKind.ZodString,
                description: schema.description,
            };
        } else if (schema instanceof ZodNumber || schema instanceof ZodBigInt) {
            return {
                type: ZodFirstPartyTypeKind.ZodNumber,
                constraints: {
                    min: def.checks.find((i: ZodNumberCheck) => i.kind === "min")?.value,
                    max: def.checks.find((i: ZodNumberCheck) => i.kind === "max")?.value,
                    isInt:
                        schema instanceof ZodBigInt ||
                        def.checks.find((i: ZodNumberCheck) => i.kind === "int") != undefined,
                },
                description: schema.description,
            };
        } else if (schema instanceof ZodBoolean) {
            return {
                type: ZodFirstPartyTypeKind.ZodBoolean,
                description: schema.description,
            };
        } else if (schema instanceof ZodDate) {
            return {
                type: ZodFirstPartyTypeKind.ZodDate,
                description: schema.description,
            };
        } else if (schema instanceof ZodAny) {
            return {
                type: ZodFirstPartyTypeKind.ZodAny,
                description: schema.description,
            };
        } else if (schema instanceof ZodNullable) {
            const subSchema = this._zodToAST(def.innerType);
            return {
                isNullable: true,
                ...subSchema,
                description: schema.description || subSchema.description,
            };
        } else if (schema instanceof ZodOptional) {
            const subSchema = this._zodToAST(def.innerType);
            return {
                isOptional: true,
                ...subSchema,
                description: schema.description || subSchema.description,
            };
        } else if (schema instanceof ZodDefault) {
            const subSchema = this._zodToAST(def.innerType);
            return {
                ...subSchema,
                description: schema.description || subSchema.description,
            };
        } else if (schema instanceof ZodArray) {
            const subSchema = this._zodToAST(def.type);

            return {
                ...subSchema,
                description: schema.description || subSchema.description,
                arrayDimension: Number.isInteger(subSchema.arrayDimension)
                    ? ++subSchema.arrayDimension!
                    : 1,
            };
        } else if (schema instanceof ZodSet) {
            return {
                type: ZodFirstPartyTypeKind.ZodSet,
                value: this._zodToAST(def.valueType),
                description: schema.description,
            };
        } else if (schema instanceof ZodLiteral) {
            let parentEnumName: string | undefined = undefined;
            let parentEnumKey: string | undefined = undefined;

            if (schema._zod2x?.parentEnum) {
                parentEnumName = schema._zod2x?.parentEnum._zod2x?.typeName;
                parentEnumKey = this._getEnumValues(schema._zod2x?.parentEnum as ZodEnum<any>).find(
                    (i) => i[1] === def.value
                )?.[0];
                this._zodToAST(schema._zod2x?.parentEnum, { isInjectedEnum: true });
            }

            return {
                type: ZodFirstPartyTypeKind.ZodLiteral,
                value: def.value,
                description: schema.description,
                parentEnumName,
                parentEnumKey,
            };
        } else if (schema instanceof ZodRecord) {
            return {
                type: ZodFirstPartyTypeKind.ZodRecord,
                key: this._zodToAST(def.keyType),
                value: this._zodToAST(def.valueType),
                description: schema.description,
            };
        } else if (schema instanceof ZodLazy) {
            /** Lazy items use to be recursive schemas of its own, so the are trated as another
             *  definition */
            const lazySchema = def.getter();
            const lazyPointer: ASTDefintion = this._createDefinition(
                "pending",
                ZodFirstPartyTypeKind.ZodAny
            );

            this.lazyPointers.push([lazyPointer, lazySchema]);

            return lazyPointer;
        } else if (schema instanceof ZodTuple) {
            return {
                type: ZodFirstPartyTypeKind.ZodTuple,
                items: def.items.map(this._zodToAST.bind(this)),
                description: schema.description,
            };
        } else if (schema instanceof ZodMap) {
            return {
                type: ZodFirstPartyTypeKind.ZodMap,
                key: this._zodToAST(def.keyType),
                value: this._zodToAST(def.valueType),
                description: schema.description,
            };
            /**
             *
             *
             * Transpilerable items
             *
             *
             * */
        } else if (schema instanceof ZodNativeEnum || schema instanceof ZodEnum) {
            return this._getEnumAst(schema, opt);
        } else if (schema instanceof ZodObject) {
            return this._getObjectAst(schema, opt);
        } else if (schema instanceof ZodUnion || schema instanceof ZodDiscriminatedUnion) {
            return this._getUnionAst(schema);
        } else if (schema instanceof ZodIntersection) {
            return this._getIntersectionAst(schema);
        } else {
            log.warn(`Unsupported Zod type: ${JSON.stringify(schema)}`);
            return {
                type: ZodFirstPartyTypeKind.ZodAny,
                description: `Unsupported Zod type: ${schema._def.typeName}`,
            };
        }
    }

    /**
     * Create the AST identifying the nodes that can be transpiled.
     * @param schema
     * @returns Transpilerable nodes.
     */
    build<T extends ZodRawShape>(schema: ZodObject<T>): ASTNodes {
        this._zodToAST(schema);

        while (this.lazyPointers.length > 0) {
            const [pointer, schema] = this.lazyPointers.shift()!;
            const lazyResolve = this._zodToAST(schema);

            /** Pointer to the pending AST node is updated with the lazy resolve */
            Object.keys(pointer).forEach((key) => {
                delete (pointer as any)[key];
            });

            Object.entries(lazyResolve).forEach(([key, value]: [string, any]) => {
                (pointer as any)[key] = value;
            });
        }

        if (this.opt.strict !== false && this.warnings.length > 0) {
            throw new AstNodeError(this.warnings.join("\n"));
        }

        return {
            nodes: this.nodes,
            warnings: this.warnings,
        };
    }
}
