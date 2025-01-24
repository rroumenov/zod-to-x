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

import { log } from "@/utils/logger";

import { ASTDefintion, ASTNode, ASTNodes, ASTObject, TranspilerableTypes } from "./ast_types";

interface IZodToAstOpt {
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
     * Transpilerable nodes
     */
    private nodes: Map<string, TranspilerableTypes>;

    /**
     * Additional transpilerable nodes supplied by ZodDiscriminatedUnion
     */
    private discriminatorNodes: Map<string, TranspilerableTypes>;

    /**
     * Lazy schemas for further analysis
     */
    private lazyPointers: Array<[ASTDefintion, ZodTypeAny]>;

    constructor() {
        this.nodes = new Map<string, any>();
        this.discriminatorNodes = new Map<string, any>();
        this.lazyPointers = [];
    }

    /**
     * Transpilerable items are treated as references in the AST
     * @param ref
     * @param refType
     * @param discriminantValue
     * @returns
     */
    private _createDefinition(
        ref: string,
        refType: ZodFirstPartyTypeKind,
        discriminantValue?: string
    ): ASTDefintion {
        return { type: "definition", reference: ref, referenceType: refType, discriminantValue };
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
     * Build the AST node of provided Zod Schema
     * @param schema
     * @returns
     */
    private zodToAST(schema: ZodTypeAny, opt?: IZodToAstOpt): ASTNode {
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
            const subSchema = this.zodToAST(def.innerType);
            return {
                isNullable: true,
                ...subSchema,
                description: schema.description || subSchema.description,
            };
        } else if (schema instanceof ZodOptional) {
            const subSchema = this.zodToAST(def.innerType);
            return {
                isOptional: true,
                ...subSchema,
                description: schema.description || subSchema.description,
            };
        } else if (schema instanceof ZodDefault) {
            const subSchema = this.zodToAST(def.innerType);
            return {
                ...subSchema,
                description: schema.description || subSchema.description,
            };
        } else if (schema instanceof ZodArray) {
            const subSchema = this.zodToAST(def.type);

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
                value: this.zodToAST(def.valueType),
                description: schema.description,
            };
        } else if (schema instanceof ZodLiteral) {
            let parentEnumName: string | undefined = undefined;
            let parentEnumKey: string | undefined = undefined;

            if (def.zod2x?.parentEnum) {
                parentEnumName = def.zod2x?.parentEnum._def.zod2x?.typeName;
                parentEnumKey = this._getEnumValues(def.zod2x?.parentEnum as ZodEnum<any>).find(
                    (i) => i[1] === def.value
                )?.[0];
                this.zodToAST(def.zod2x?.parentEnum, { isInjectedEnum: true });
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
                key: this.zodToAST(def.keyType),
                value: this.zodToAST(def.valueType),
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
                items: def.items.map(this.zodToAST.bind(this)),
                description: schema.description,
            };
        } else if (schema instanceof ZodMap) {
            return {
                type: ZodFirstPartyTypeKind.ZodMap,
                key: this.zodToAST(def.keyType),
                value: this.zodToAST(def.valueType),
                description: schema.description,
            };
        } else if (schema instanceof ZodNativeEnum || schema instanceof ZodEnum) {
            /** Transpilerable items */
            let name: string = def.zod2x?.typeName!;

            const item: TranspilerableTypes = {
                type: def.typeName,
                name: def.zod2x?.typeName,
                values: this._getEnumValues(schema),
                description: def.description,
            };

            if (opt?.isInjectedEnum) {
                if (!this.nodes.has(name) && !this.discriminatorNodes.has(name)) {
                    this.discriminatorNodes.set(name, item);
                }
            } else {
                if (!this.nodes.has(name)) {
                    this.nodes.set(name, item);
                }

                if (this.discriminatorNodes.has(name)) {
                    this.discriminatorNodes.delete(name);
                }
            }

            return this._createDefinition(name, def.typeName);
        } else if (schema instanceof ZodObject) {
            let name: string = def.zod2x?.typeName!;
            let discriminantValue: string | undefined = undefined;

            if (!this.nodes.has(name)) {
                const properties: Record<string, ASTNode> = {};
                for (const key in def.shape()) {
                    properties[key] = this.zodToAST(def.shape()[key]);
                }

                this.nodes.set(name, {
                    type: ZodFirstPartyTypeKind.ZodObject,
                    name: def.zod2x?.typeName,
                    properties,
                    description: schema.description,
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

            return this._createDefinition(name, def.typeName, discriminantValue);
        } else if (schema instanceof ZodUnion || schema instanceof ZodDiscriminatedUnion) {
            let name: string = def.zod2x?.typeName as string;

            const item: ASTNode | TranspilerableTypes = {
                type: def.typeName,
                name: def.zod2x?.typeName,
                options: def.options.map((i: ZodTypeAny) =>
                    this.zodToAST(i, { discriminantKey: def.discriminator })
                ),
                description: schema.description,
                discriminantKey: def.discriminator,
            };

            if (name && !this.nodes.has(name)) {
                this.nodes.set(name, item);
                return this._createDefinition(name, def.typeName);
            }

            return item;
        } else if (schema instanceof ZodIntersection) {
            let name: string = def.zod2x?.typeName as string;

            const item: ASTNode | TranspilerableTypes = {
                type: ZodFirstPartyTypeKind.ZodIntersection,
                name: def.zod2x?.typeName,
                left: this.zodToAST(def.left),
                right: this.zodToAST(def.right),
                description: schema.description,
            };

            if (name && !this.nodes.has(name)) {
                this.nodes.set(name, item);
                return this._createDefinition(name, def.typeName);
            }

            return item;
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
        this.zodToAST(schema);

        while (this.lazyPointers.length > 0) {
            const [pointer, schema] = this.lazyPointers.shift()!;
            const lazyResolve = this.zodToAST(schema);

            /** Pointer to the pending AST node is updated with the lazy resolve */
            Object.keys(pointer).forEach((key) => {
                delete (pointer as any)[key];
            });

            Object.entries(lazyResolve).forEach(([key, value]: [string, any]) => {
                (pointer as any)[key] = value;
            });
        }

        return {
            nodes: [...this.nodes.values()],
            discriminatorNodes: [...this.discriminatorNodes.values()],
        };
    }
}
