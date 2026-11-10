import { z, ZodEnum, ZodLiteral, ZodNumber, ZodObject, ZodType } from "zod/v4";

import {
    getZod2xMetadata,
    IZod2xResolvedMetadata,
    resolveZod2xMetadata,
    setZod2xMetadata,
} from "./zod2x_metadata";
import { Extended } from "./zod_ext";

export type {
    ZodArray,
    ZodType,
    ZodIntersection,
    ZodObject,
    ZodEnum,
    ZodDiscriminatedUnion,
    ZodUnion,
    ZodLiteral,
} from "zod/v4";
export type ZodAnyUnionType = z.ZodUnion<any> | z.ZodDiscriminatedUnion<any>;

type ZodNumberConstraints = {
    min?: number;
    max?: number;
    isInt: boolean;
};

export enum ZodFirstPartyTypeKind {
    ZodAny = "any",
    ZodString = "string",
    ZodNumber = "number",
    ZodBigInt = "bigint",
    ZodLiteral = "literal",
    ZodBoolean = "boolean",
    ZodDate = "date",
    ZodEnum = "enum",
    ZodUnion = "union",
    ZodIntersection = "intersection",
    ZodObject = "object",
    ZodLazy = "lazy",
    ZodRecord = "record",
    ZodMap = "map",
    ZodSet = "set",
    ZodArray = "array",
    ZodTuple = "tuple",
    ZodOptional = "optional",
    ZodNullable = "nullable",
    ZodDefault = "default",
    ZodPromise = "promise",
    ZodUnknown = "unknown",
    ZodPrefault = "prefault",
    ZodCatch = "catch",
    ZodReadonly = "readonly",
    ZodNonOptional = "nonoptional",
    ZodPipe = "pipe",
    ZodTransform = "transform",
    ZodNull = "null",
    ZodUndefined = "undefined",
    ZodVoid = "void",
    ZodNever = "never",
    ZodNaN = "nan",
    ZodSymbol = "symbol",
    ZodCustom = "custom",
    ZodFunction = "function",
    ZodFile = "file",
    ZodTemplateLiteral = "template_literal",
    ZodSuccess = "success",
}

/**
 * Zod's type is checked insted of instanceof to resolve Bun incomatibilities.
 */
export class ZodHelpers {
    static isZodType(i: ZodType): boolean {
        return Object.values(ZodFirstPartyTypeKind).includes(i?.def?.type as ZodFirstPartyTypeKind);
    }

    static isZodUnknown(i: ZodType): i is z.ZodUnknown {
        return i?.def?.type === ZodFirstPartyTypeKind.ZodUnknown;
    }

    static isZodNonOptional(i: ZodType): i is z.ZodNonOptional<any> {
        return i?.def?.type === ZodFirstPartyTypeKind.ZodNonOptional;
    }

    static isZodPipe(i: ZodType): i is z.ZodPipe<any, any> {
        return i?.def?.type === ZodFirstPartyTypeKind.ZodPipe;
    }

    static isZodTransform(i: ZodType): i is z.ZodTransform {
        return i?.def?.type === ZodFirstPartyTypeKind.ZodTransform;
    }

    /**
     * Wrappers that do not change the output type of their inner schema: `.default()`,
     * `.prefault()`, `.catch()` and `.readonly()`.
     */
    static isZodTransparentWrapper(
        i: ZodType
    ): i is z.ZodDefault<any> | z.ZodPrefault<any> | z.ZodCatch<any> | z.ZodReadonly<any> {
        const type = i?.def?.type;
        return (
            type === ZodFirstPartyTypeKind.ZodDefault ||
            type === ZodFirstPartyTypeKind.ZodPrefault ||
            type === ZodFirstPartyTypeKind.ZodCatch ||
            type === ZodFirstPartyTypeKind.ZodReadonly
        );
    }

    /**
     * Returns the schema that represents the data model of a pipe. The output side is used
     * (e.g. `z.string().pipe(z.coerce.number())` or codecs), unless it is a transformation whose
     * output type cannot be known, in which case the input side is used.
     */
    static getPipeModelSchema(i: z.ZodPipe<any, any>): ZodType {
        const out = i.def.out as ZodType;
        return this.isZodTransform(out) ? (i.def.in as ZodType) : out;
    }

    /**
     * Returns a short structural signature of a schema, used to tell apart two different schemas
     * that share the same type name.
     */
    static getShallowSignature(
        i: ZodType,
        resolve: (schema: ZodType) => IZod2xResolvedMetadata | undefined = resolveZod2xMetadata,
        depth = 0
    ): string {
        const typeName = resolve(i)?.typeName;
        if (typeName) {
            return `#${typeName}`;
        }

        const def = i?.def as any;
        const inner: ZodType | undefined = def?.innerType ?? def?.element;
        return inner && depth < 5
            ? `${def.type}<${this.getShallowSignature(inner, resolve, depth + 1)}>`
            : `${def?.type}`;
    }

    static isZodAny(i: ZodType): i is z.ZodAny {
        return i?.def?.type === ZodFirstPartyTypeKind.ZodAny;
    }

    static isZodString(i: ZodType): i is z.ZodString {
        return i?.def?.type === ZodFirstPartyTypeKind.ZodString;
    }

    static isZodNumber(i: ZodType): i is z.ZodNumber {
        return i?.def?.type === ZodFirstPartyTypeKind.ZodNumber;
    }

    static isZodBigInt(i: ZodType): i is z.ZodBigInt {
        return i?.def?.type === ZodFirstPartyTypeKind.ZodBigInt;
    }

    static isZodLiteral(i: ZodType): i is z.ZodLiteral<any> {
        return i?.def?.type === ZodFirstPartyTypeKind.ZodLiteral;
    }

    static isZodBoolean(i: ZodType): i is z.ZodBoolean {
        return i?.def?.type === ZodFirstPartyTypeKind.ZodBoolean;
    }

    static isZodDate(i: ZodType): i is z.ZodDate {
        return i?.def?.type === ZodFirstPartyTypeKind.ZodDate;
    }

    static isZodEnum(i: ZodType): i is ZodEnum<any> {
        return i?.def?.type === ZodFirstPartyTypeKind.ZodEnum;
    }

    static isZodUnion(i: ZodType): i is z.ZodUnion<any> {
        return (
            i?.def?.type === ZodFirstPartyTypeKind.ZodUnion &&
            (i as z.ZodDiscriminatedUnion)._zod?.def?.discriminator === undefined
        );
    }

    static isZodDiscriminatedUnion(i: ZodType): i is z.ZodDiscriminatedUnion {
        return (
            i?.def?.type === ZodFirstPartyTypeKind.ZodUnion &&
            (i as z.ZodDiscriminatedUnion)._zod?.def?.discriminator !== undefined
        );
    }

    static isZodIntersection(i: ZodType): i is z.ZodIntersection<any, any> {
        return i?.def?.type === ZodFirstPartyTypeKind.ZodIntersection;
    }

    static isZodObject(i: ZodType): i is z.ZodObject<any> {
        return i?.def?.type === ZodFirstPartyTypeKind.ZodObject;
    }

    static isZodLazy(i: ZodType): i is z.ZodLazy<any> {
        return i?.def?.type === ZodFirstPartyTypeKind.ZodLazy;
    }

    static isZodRecord(i: ZodType): i is z.ZodRecord<any, any> {
        return i?.def?.type === ZodFirstPartyTypeKind.ZodRecord;
    }

    static isZodMap(i: ZodType): i is z.ZodMap<any, any> {
        return i?.def?.type === ZodFirstPartyTypeKind.ZodMap;
    }

    static isZodArray(i: ZodType): i is z.ZodArray<any> {
        return i?.def?.type === ZodFirstPartyTypeKind.ZodArray;
    }

    static isZodSet(i: ZodType): i is z.ZodSet<any> {
        return i?.def?.type === ZodFirstPartyTypeKind.ZodSet;
    }

    static isZodTuple(i: ZodType): i is z.ZodTuple<any> {
        return i?.def?.type === ZodFirstPartyTypeKind.ZodTuple;
    }

    static isZodOptional(i: ZodType): i is z.ZodOptional<any> {
        return i?.def?.type === ZodFirstPartyTypeKind.ZodOptional;
    }

    static isZodNullable(i: ZodType): i is z.ZodNullable<any> {
        return i?.def?.type === ZodFirstPartyTypeKind.ZodNullable;
    }

    static isZodDefault(i: ZodType): i is z.ZodDefault<any> {
        return i?.def?.type === ZodFirstPartyTypeKind.ZodDefault;
    }

    static isZodPromise<T extends ZodType>(i: ZodType): i is z.ZodPromise<T> {
        return i?.def?.type === ZodFirstPartyTypeKind.ZodPromise;
    }

    static isZodAnyUnionType(i: ZodType) {
        return this.isZodUnion(i) || this.isZodDiscriminatedUnion(i);
    }

    static isZodAnyNumberType(i: ZodType) {
        return this.isZodNumber(i) || this.isZodBigInt(i);
    }

    static isZodAnyMapType(i: ZodType) {
        return this.isZodMap(i) || this.isZodRecord(i);
    }

    /**
     * Complex types that shall always be transpiled, which output would be a type, or alias if
     * redefined using layered modeling.
     * @param zodType
     * @returns
     */
    static isTranspilerableZodType(zodType: string | ZodType): boolean {
        const type = typeof zodType === "string" ? zodType : zodType?.def?.type;

        return (
            type === ZodFirstPartyTypeKind.ZodEnum ||
            type === ZodFirstPartyTypeKind.ZodObject ||
            type === ZodFirstPartyTypeKind.ZodUnion ||
            type === ZodFirstPartyTypeKind.ZodIntersection
        );
    }

    /**
     * Primitive types that can only be transpiled if defined using layered modeling, which output
     * would be a type alias.
     * @param zodType
     * @param onlyArray Array types are always transpiled as alias in layered modeling.
     * @returns
     */
    static isTranspilerableAliasedZodType(zodType: string | ZodType, onlyArray = false): boolean {
        const type = typeof zodType === "string" ? zodType : zodType?.def?.type;

        if (onlyArray === true) {
            return type === ZodFirstPartyTypeKind.ZodArray;
        }

        return (
            type === ZodFirstPartyTypeKind.ZodString ||
            type === ZodFirstPartyTypeKind.ZodNumber ||
            type === ZodFirstPartyTypeKind.ZodBigInt ||
            type === ZodFirstPartyTypeKind.ZodBoolean ||
            type === ZodFirstPartyTypeKind.ZodDate ||
            type === ZodFirstPartyTypeKind.ZodAny ||
            type === ZodFirstPartyTypeKind.ZodMap ||
            type === ZodFirstPartyTypeKind.ZodSet ||
            type === ZodFirstPartyTypeKind.ZodRecord ||
            type === ZodFirstPartyTypeKind.ZodTuple ||
            type === ZodFirstPartyTypeKind.ZodArray
        );
    }

    /**
     * Creates a new instance of the schema with the same definition. Zod metadata (description,
     * ...) is inherited from the original schema.
     */
    static cloneZod(i: ZodType) {
        return i.clone();
    }

    /**
     * Checks if a schema was documented on a copy of another one (`.describe()`), even with its
     * same text. Zod keeps the metadata of each schema in its registry, and the copies inherit
     * the one of their parent, so inherited descriptions are not in the entry of the schema.
     */
    static hasOwnDescription(i: ZodType): boolean {
        return (
            i._zod.parent !== undefined &&
            Extended.getZ().globalRegistry._map.get(i)?.description !== undefined
        );
    }

    /**
     * Zod2X generics are represented as Promise<"TypeName">.
     * Ex: z.promise(z.literal("K")) will be transpiled to Template<K>
     */
    static isZod2XGeneric(i: ZodType): boolean {
        return this.getGenericTemplateName(i) !== undefined;
    }

    /**
     * Returns the template name of a generic template created with `createGenericType`, if the
     * schema is one. Templates defined as `z.promise(z.literal("T"))` (the marker used by
     * previous versions) are supported too.
     */
    static getGenericTemplateName(i: ZodType): string | undefined {
        // Templates are unknown schemas, so the metadata of other schemas is not read.
        if (this.isZodUnknown(i)) {
            return getZod2xMetadata(i)?.genericTemplate;
        }

        if (this.isZodPromise<ZodLiteral>(i) && this.isZodLiteral(i.unwrap())) {
            const value = i.unwrap().def.values[0];
            return typeof value === "string" ? value : undefined;
        }

        return undefined;
    }

    static createZodObject(properties: Map<string, ZodType>): ZodObject<any> {
        return Extended.getZ().object(Object.fromEntries(properties));
    }

    static getZodNumberConstraints(i: ZodNumber | z.ZodBigInt): ZodNumberConstraints {
        const constraints: ZodNumberConstraints = {
            isInt: this.isZodBigInt(i) || i.format === "safeint",
            min:
                typeof i.minValue === "number" &&
                isFinite(i.minValue) &&
                Math.abs(i.minValue) !== Number.MAX_SAFE_INTEGER
                    ? (i.minValue as number)
                    : undefined,
            max:
                typeof i.maxValue === "number" &&
                isFinite(i.maxValue) &&
                Math.abs(i.maxValue) !== Number.MAX_SAFE_INTEGER
                    ? (i.maxValue as number)
                    : undefined,
        };

        return constraints;
    }
}

/**
 * Creates a generic template to be used as a property of a generic ZodObject.
 * @param name Template name. Ex: "T", "K", "TData", ...
 * @param defaultType Optional type used by `useGenericType` when no type is provided for the
 * template. It can be any supported type: basic types, arrays, named types, ...
 * @returns The generic template.
 */
export function createGenericType(name: string, defaultType?: ZodType) {
    // Any value is valid for a template until a type is provided for it with `useGenericType`.
    return setZod2xMetadata(Extended.getZ().unknown(), {
        genericTemplate: name,
        ...(defaultType ? { genericDefault: defaultType } : {}),
    });
}

/**
 * Use generic types defined in a generic ZodObject by replacing them with the actual child types.
 * The new type references the generic type and the child types used for each template, so its
 * type name, layer and templates translation are resolved from them when transpiled.
 * @param genObj ZodObject with generic types.
 * @param childrens Record of child types to replace generics. Templates created with a default
 * type can be omitted.
 * @returns The extended ZodObject with replaced generic types.
 */
export function useGenericType(
    genObj: ZodObject<any>,
    childrens: Record<string, ZodType>,
    skipLazy: true
): ZodObject<any>;
export function useGenericType(
    genObj: ZodObject<any>,
    childrens: Record<string, ZodType>,
    skipLazy?: false
): z.ZodLazy<ZodObject<any>>;
export function useGenericType(
    genObj: ZodObject<any>,
    childrens: Record<string, ZodType>,
    skipLazy?: boolean
): ZodObject<any> | z.ZodLazy<ZodObject<any>> {
    const builder = () => {
        let extended = genObj;
        const templates: [string, ZodType][] = [];

        // Zod 4's extend() doesn't copy meta() (unlike Zod 3 which spread _def).
        // Capture it once so it can be restored after each extend call, keeping the
        // description of the generic type.
        // The id is not restored because it must be unique in Zod's global registry.
        const { id: _id, ...genObjMeta } = genObj.meta() ?? {};
        for (const [key, property] of Object.entries<ZodType>(genObj.shape)) {
            if (ZodHelpers.isZod2XGeneric(property)) {
                const childType = childrens[key] ?? getZod2xMetadata(property)?.genericDefault;
                if (!childType) {
                    throw new Error(
                        `Missing child type for generic property ${key} in ` +
                            `${resolveZod2xMetadata(genObj)?.typeName}.`
                    );
                }
                extended = extended.extend({ [key]: childType });
                if (Object.keys(genObjMeta).length > 0) {
                    extended = extended.meta({ ...genObjMeta }) as ZodObject<any>;
                }
                templates.push([key, childType]);
            }
        }

        if (templates.length > 0) {
            // Type name and layer are taken from the generic type when resolved.
            setZod2xMetadata(extended, { genericOf: { generic: genObj, templates } });
        }

        return extended;
    };

    return skipLazy ? builder() : Extended.getZ().lazy(builder);
}
