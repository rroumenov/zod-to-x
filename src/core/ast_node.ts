import {
    ASTAliasedTypes,
    ASTAny,
    ASTArray,
    ASTBoolean,
    ASTDate,
    ASTDefintion,
    ASTEnum,
    ASTIntersection,
    ASTLiteral,
    ASTMap,
    ASTNode,
    ASTNodes,
    ASTNumber,
    ASTObject,
    ASTSet,
    ASTString,
    ASTTuple,
    ASTType,
    ASTUnion,
} from "@/core";
import { IZod2xLayerMetadata, IZod2xMetadata } from "@/lib/zod_ext";
import {
    ZodAnyEnumType,
    ZodAnyUnionType,
    ZodArray,
    ZodHelpers,
    ZodIntersection,
    ZodObject,
    ZodTypeAny,
} from "@/lib/zod_helpers";
import { log } from "@/utils/logger";

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

    /**
     * Indicates if node creation is called from an array schema. Used to indicate the parent
     * array schema.
     */
    calledFromArray?: boolean;
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
    private nodes: Map<string, ASTNode>;

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
        this.nodes = new Map<string, ASTNode>();
        this.lazyPointers = [];
        this.warnings = [];

        this.opt = {
            ...opt,
            strict: opt.strict ?? true,
        };
    }

    /**
     * Determines if the current node is an "own property" based on the provided parent file.
     *
     * @param parentFile - The file path of the parent to compare against, if exist.
     * @returns `true` if the node is an "own property"; otherwise, `false`.
     */
    private _isOwnProperty(parentFile?: string): boolean {
        return (
            this.opt.layer === undefined ||
            parentFile === undefined ||
            this.opt.layer?.file === parentFile
        );
    }

    /**
     * Check if the layer of the item is compatible with the layer of the schema. If does and the
     * transpilerable item is in a different file, it returns the file name.
     *
     * @param itemName
     * @param metadata
     * @returns
     */
    private _getTranspilerableFile(
        itemName: string,
        metadata?: IZod2xMetadata
    ): { parentFile?: string; parentNamespace?: string; aliasOf?: string } {
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
                        aliasOf: metadata?.aliasOf,
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
                    aliasOf: undefined,
                };
            }
        }

        return {};
    }

    /**
     * Transpilerable items are treated as references in the AST
     * @param node: AST node from which the definition will be created
     * @param constraints - Constraints to be added to the definition
     * @returns
     */
    private _createDefinition(node: ASTNode, constraints = {}): ASTDefintion {
        return new ASTDefintion({
            name: node.name!,
            instanceType: node.constructor.name,
            parentFile: node.parentFile,
            parentNamespace: node.parentNamespace,
            aliasOf: node.aliasOf,
            constraints:
                "constraints" in node
                    ? { ...(node.constraints as Record<string, any>), ...constraints }
                    : constraints,
        });
    }

    /**
     * Extracts and formats the enumeration values from a given ZodEnum or ZodNativeEnum schema.
     * @param schema - A ZodEnum or ZodNativeEnum schema containing the enumeration values.
     * @returns A list of key-value pairs where the key is a formatted string and the value
     *          is either a string or a number.
     */
    private _getEnumValues(schema: ZodAnyEnumType): [string, string | number][] {
        if (ZodHelpers.isZodEnum(schema)) {
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
        const leftData = this.nodes.get(left.name) as ASTObject;
        const rightData = this.nodes.get(right.name) as ASTObject;

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
        let typeA, typeB;
        const data = options.map((i) => this.nodes.get(i.name) as ASTObject);
        return {
            properties: data.reduce((acc: Record<string, ASTType>, i, j) => {
                for (const key in i.properties) {
                    if (acc[key]) {
                        acc[key] = structuredClone(acc[key]);
                        typeA = acc[key].constructor.name;
                        typeB = i.properties[key].constructor.name;

                        if (typeA !== typeB) {
                            this.warnings.push(
                                `Merging properties with different types: ${typeA} ` +
                                    `(from ${data[j - 1]?.name}) and ${typeB} ` +
                                    `(from ${i.name})`
                            );
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

    /**
     * Retrieves the name and associated transpilerable file information for a given Zod schema.
     *
     * @param schema - The Zod schema to extract the name and file information from.
     *
     * @returns An object containing the `name` of the schema and additional transpilerable file
     *          details.
     *
     * @throws AstTypeNameDefinitionError - If the schema does not have a `typeName` defined.
     * This can occur if layered modeling is used with nested schema definitions or if the `zod2x`
     * method is not used to provide a `typeName`. The error message includes details about the
     * affected type properties.
     */
    private _getNames(schema: ZodTypeAny) {
        const name = schema._zod2x?.typeName;

        if (!name) {
            let itemProperties: string[] = ["Unknown type"];

            if (ZodHelpers.isZodObject(schema)) {
                itemProperties = Object.keys(schema._def.shape());
            } else if (ZodHelpers.isZodAnyUnionType(schema)) {
                itemProperties = schema._def.options.map(
                    (i: ZodTypeAny) => i._zod2x?.typeName || i._def.typeName
                );
            } else if (ZodHelpers.isZodIntersection(schema)) {
                itemProperties = [
                    schema._def.left._zod2x?.typeName || schema._def.left._def.typeName,
                    schema._def.right._zod2x?.typeName || schema._def.right._def.typeName,
                ];
            } else if (ZodHelpers.isZodAnyEnumType(schema)) {
                itemProperties = this._getEnumValues(schema).map((i) => i[0]);
            }

            throw new AstTypeNameDefinitionError(
                `${schema._def.typeName} type must have a typeName. If Layered modeling is used, ` +
                    `avoid nesting schemas definitions. Otherwise, use zod2x method to provide one. ` +
                    `Affected type properties: ${itemProperties.join(", ")}`
            );
        }

        return {
            name,
            ...this._getTranspilerableFile(name, schema._zod2x),
        };
    }

    /**
     * Generates an Abstract Syntax Tree (AST) definition for a Zod enum schema.
     *
     * @param schema - The Zod enum schema to process.
     * @param opt - Optional metadata for schema processing.
     *   - `isInjectedEnum` (optional): Indicates if the enum is part of a discriminated union.
     *
     * @returns The AST definition for the provided enum schema.
     */
    private _getEnumAst(schema: ZodAnyEnumType, opt?: ISchemasMetadata): ASTDefintion {
        const { name, parentFile, parentNamespace, aliasOf } = this._getNames(schema);

        const item = new ASTEnum({
            name,
            values: this._getEnumValues(schema),
            description: schema._def.description,
            parentFile,
            parentNamespace,
            aliasOf,
            isFromDiscriminatedUnion: opt?.isInjectedEnum,
        });

        if (!this.nodes.has(name)) {
            this.nodes.set(name, item);
        }

        return this._createDefinition(item);
    }

    /**
     * Generates an abstract syntax tree (AST) definition for a Zod object schema.
     *
     * @param schema - The ZodObject schema to be converted into an AST definition.
     * @param opt - Optional metadata for schema processing.
     *   - `discriminantKey`: A key used to determine the discriminant value for the schema.
     *
     * @returns The AST definition for the provided Zod object schema.
     */
    private _getObjectAst(schema: ZodObject<any>, opt?: ISchemasMetadata): ASTDefintion {
        const { name, parentFile, parentNamespace, aliasOf } = this._getNames(schema);

        let discriminantValue: string | undefined = undefined;

        const shape = schema._def.shape();

        if (!this.nodes.has(name)) {
            const properties: Record<string, ASTType> = {};
            for (const key in shape) {
                properties[key] = this._zodToAST(shape[key]);
            }

            this.nodes.set(
                name,
                new ASTObject({
                    name,
                    properties,
                    description: schema.description,
                    parentFile,
                    parentNamespace,
                    aliasOf,
                })
            );
        }

        const item = this.nodes.get(name) as ASTObject;

        if (opt?.discriminantKey) {
            if (Object.keys(item.properties).includes(opt.discriminantKey)) {
                const key = opt.discriminantKey;
                if (item.properties[key] instanceof ASTLiteral) {
                    /* Used for serialization purposes, it is parsed as string for
                     * convenience */
                    discriminantValue = item.properties[key].value.toString();
                } else {
                    console.warn(`Consider to set '${key}' key of '${name}' as ZodLiteral`);
                }
            }
        }

        return this._createDefinition(this.nodes.get(name) as ASTObject, { discriminantValue });
    }

    /**
     * Generates an Abstract Syntax Tree (AST) definition for a Zod union schema.
     *
     * This method processes a Zod union schema and creates an `ASTUnion` object
     * that represents the schema in an AST format. It handles both regular unions
     * and discriminated unions, and provides warnings for certain bad data modeling
     * practices, such as unions of non-object types or the use of `ZodUnion` instead
     * of `ZodDiscriminatedUnion`.
     *
     * @param schema - The Zod union schema to be converted into an AST definition.
     *                 This can be a regular union or a discriminated union.
     *
     * @returns The AST definition for the given Zod union schema.
     */
    private _getUnionAst(schema: ZodAnyUnionType): ASTDefintion {
        const def = schema._def;
        const discriminator = ZodHelpers.isZodDiscriminatedUnion(schema)
            ? schema._def.discriminator
            : undefined;

        const { name, parentFile, parentNamespace, aliasOf } = this._getNames(schema);

        const item = new ASTUnion({
            name,
            options: def.options.map((i: ZodTypeAny) =>
                this._zodToAST(i, { discriminantKey: discriminator })
            ),
            areAllObjects: def.options.every((i: ZodTypeAny) => ZodHelpers.isZodObject(i)),
            description: schema.description,
            discriminantKey: discriminator,
            parentFile,
            parentNamespace,
            aliasOf,
        });

        if (!item.areAllObjects) {
            if (this._isOwnProperty(parentFile)) {
                this.warnings.push(
                    `[affected type: ${name}] Union of non-object types is a bad data modeling ` +
                        "practice, and could lead to unexpected results. Avoid it, or disable " +
                        "strict mode if not possible."
                );
            }
        } else if (ZodHelpers.isZodUnion(schema)) {
            if (this._isOwnProperty(parentFile)) {
                this.warnings.push(
                    `[affected type: ${name}] Using ZodUnion is a bad data modeling practice. ` +
                        "Use ZodDiscriminatedUnion instead, or disable strict mode if not possible."
                );
            }

            item.newObject = new ASTObject({
                name,
                properties: this._unionAstNodes(item.options as ASTDefintion[]).properties,
                description:
                    (schema.description ? `${schema.description} - ` : "") +
                    `Built from union of ` +
                    `${item.options.map((i) => (i as ASTDefintion).name).join(", ")}`,
            });
        }

        if (name && !this.nodes.has(name)) {
            this.nodes.set(name, item);
        }

        return this._createDefinition(item);
    }

    /**
     * Processes a ZodIntersection schema and generates an ASTDefinition for it.
     *
     * @param schema - The ZodIntersection schema to process, which combines two Zod types.
     *
     * @returns An ASTDefinition representing the intersection of the two Zod types.
     */
    private _getIntersectionAst(schema: ZodIntersection<ZodTypeAny, ZodTypeAny>): ASTDefintion {
        const def = schema._def;
        const { name, parentFile, parentNamespace, aliasOf } = this._getNames(schema);

        const item = new ASTIntersection({
            name,
            left: this._zodToAST(def.left),
            right: this._zodToAST(def.right),
            areAllObjects: ZodHelpers.isZodObject(def.left) && ZodHelpers.isZodObject(def.right),
            description: schema.description,
            parentFile,
            parentNamespace,
            aliasOf,
        });

        if (!item.areAllObjects) {
            if (this._isOwnProperty(parentFile)) {
                this.warnings.push(
                    `[affected type: ${name}] Intersection of non-object is a bad data modeling ` +
                        "practice, and could lead to unexpected results. Avoid it, or disable " +
                        "strict mode if not possible."
                );
            }
        } else {
            item.newObject = new ASTObject({
                name,
                properties: this._intersectAstNodes(
                    item.left as ASTDefintion,
                    item.right as ASTDefintion
                ).properties,
                description:
                    (schema.description ? `${schema.description} - ` : "") +
                    `Built from intersection of ` +
                    `${(item.left as ASTDefintion).name} and ` +
                    `${(item.right as ASTDefintion).name}`,
            });
        }

        if (name && !this.nodes.has(name)) {
            this.nodes.set(name, item);
        }

        return this._createDefinition(item);
    }

    /**
     * Generates an AST (Abstract Syntax Tree) definition for a Zod array schema.
     *
     * @param schema - The Zod array schema to process.
     * @param innerSchema - The AST type representing the inner schema of the array.
     * @returns The AST definition for the array schema.
     */
    private _getArrayAst(schema: ZodArray<any>, innerSchema: ASTType): ASTDefintion {
        const { name, parentFile, parentNamespace, aliasOf } = this._getNames(schema);

        const item = new ASTArray({
            name,
            item: innerSchema,
            description: schema.description,
            parentFile,
            parentNamespace,
            aliasOf,
        });

        if (!this.nodes.has(name)) {
            this.nodes.set(name, item);
        }

        return this._createDefinition(item);
    }

    private _getAliasAst(
        schema: ZodTypeAny,
        item: ASTAliasedTypes
    ): ASTDefintion | ASTAliasedTypes {
        if (schema._zod2x?.typeName === undefined) {
            return item;
        }

        const { name, parentFile, parentNamespace, aliasOf } = this._getNames(schema);

        item.name = name;
        item.parentFile = parentFile;
        item.parentNamespace = parentNamespace;
        item.aliasOf = aliasOf;

        if (!this.nodes.has(name)) {
            this.nodes.set(name, item);
        }

        return this._createDefinition(item);
    }

    /**
     * Build the AST node of provided Zod Schema
     * @param schema
     * @returns
     */
    private _zodToAST(schema: ZodTypeAny, opt?: ISchemasMetadata): ASTType {
        const def = schema._def;

        if (ZodHelpers.isZodString(schema)) {
            return this._getAliasAst(schema, new ASTString({ description: schema.description }));
        } else if (ZodHelpers.isZodAnyNumberType(schema)) {
            return this._getAliasAst(
                schema,
                new ASTNumber({
                    description: schema.description,
                    constraints: ZodHelpers.getZodNumberConstraints(schema),
                })
            );
        } else if (ZodHelpers.isZodBoolean(schema)) {
            return this._getAliasAst(schema, new ASTBoolean({ description: schema.description }));
        } else if (ZodHelpers.isZodDate(schema)) {
            return this._getAliasAst(schema, new ASTDate({ description: schema.description }));
        } else if (ZodHelpers.isZodAny(schema)) {
            return this._getAliasAst(schema, new ASTAny({ description: schema.description }));
        } else if (ZodHelpers.isZodNullable(schema)) {
            const subSchema = this._zodToAST(schema.unwrap());
            subSchema.isNullable = true;
            subSchema.description = schema.description || subSchema.description;
            return subSchema;
        } else if (ZodHelpers.isZodOptional(schema)) {
            const subSchema = this._zodToAST(schema.unwrap());
            subSchema.isOptional = true;
            subSchema.description = schema.description || subSchema.description;
            return subSchema;
        } else if (ZodHelpers.isZodDefault(schema)) {
            const subSchema = this._zodToAST(def.innerType);
            subSchema.description = schema.description || subSchema.description;
            return subSchema;
        } else if (ZodHelpers.isZodArray(schema)) {
            const isParentArray = opt?.calledFromArray !== true;
            const subSchema = this._zodToAST(def.type, { calledFromArray: true });
            subSchema.description = schema.description || subSchema.description;
            subSchema.arrayDimension = Number.isInteger(subSchema.arrayDimension)
                ? ++subSchema.arrayDimension!
                : 1;

            if (isParentArray && schema._zod2x?.typeName) {
                return this._getArrayAst(schema, subSchema);
            } else {
                return subSchema;
            }
        } else if (ZodHelpers.isZodSet(schema)) {
            return this._getAliasAst(
                schema,
                new ASTSet({
                    value: this._zodToAST(def.valueType),
                    description: schema.description,
                })
            );
        } else if (ZodHelpers.isZodLiteral(schema)) {
            let parentEnum: ASTDefintion | undefined = undefined;
            let parentEnumKey: string | undefined = undefined;

            if (schema._zod2x?.parentEnum) {
                parentEnumKey = this._getEnumValues(schema._zod2x?.parentEnum).find(
                    (i) => i[1] === def.value
                )?.[0];
                parentEnum = this._zodToAST(schema._zod2x?.parentEnum, {
                    isInjectedEnum: true,
                }) as ASTDefintion;
            }

            return new ASTLiteral({
                value: def.value,
                description: schema.description,
                parentEnum: parentEnum,
                parentEnumKey,
            });
        } else if (ZodHelpers.isZodAnyMapType(schema)) {
            return this._getAliasAst(
                schema,
                new ASTMap({
                    type: ZodHelpers.isZodRecord(schema) ? "record" : "map",
                    key: this._zodToAST(def.keyType),
                    value: this._zodToAST(def.valueType),
                    description: schema.description,
                })
            );
        } else if (ZodHelpers.isZodLazy(schema)) {
            /** Lazy items use to be recursive schemas of its own, so the are trated as another
             *  definition */
            const lazySchema = def.getter();
            const lazyPointer: ASTDefintion = this._createDefinition({ name: "pending" });

            this.lazyPointers.push([lazyPointer, lazySchema]);

            return lazyPointer;
        } else if (ZodHelpers.isZodTuple(schema)) {
            return this._getAliasAst(
                schema,
                new ASTTuple({
                    items: def.items.map(this._zodToAST.bind(this)),
                    description: schema.description,
                })
            );
            /**
             *
             *
             * Transpilerable items
             *
             *
             * */
        } else if (ZodHelpers.isZodAnyEnumType(schema)) {
            return this._getEnumAst(schema, opt);
        } else if (ZodHelpers.isZodObject(schema)) {
            return this._getObjectAst(schema, opt);
        } else if (ZodHelpers.isZodAnyUnionType(schema)) {
            return this._getUnionAst(schema);
        } else if (ZodHelpers.isZodIntersection(schema)) {
            return this._getIntersectionAst(schema);
        } else {
            log.warn(`Unsupported Zod type: ${JSON.stringify(schema)}`);
            return new ASTAny({
                description: `Unsupported Zod type: ${schema._def.typeName}`,
            });
        }
    }

    /**
     * Create the AST identifying the nodes that can be transpiled.
     * @param schema
     * @returns Transpilerable nodes.
     */
    build(schema: ZodObject<any>): ASTNodes {
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
