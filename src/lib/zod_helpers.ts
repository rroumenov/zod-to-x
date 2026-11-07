import {
    z,
    ZodEnum,
    ZodFirstPartyTypeKind,
    ZodNativeEnum,
    ZodNumber,
    ZodObject,
    ZodTypeAny,
} from "zod";

import {
    IZod2xResolvedMetadata,
    linkToSource,
    resolveZod2xMetadata,
    setZod2xMetadata,
} from "./zod2x_metadata";
import { Extended } from "./zod_ext";

export type { ZodArray, ZodTypeAny, ZodIntersection, ZodObject } from "zod";
export type ZodAnyEnumType = ZodEnum<any> | ZodNativeEnum<any>;
export type ZodAnyUnionType = z.ZodUnion<any> | z.ZodDiscriminatedUnion<any, any>;

type ZodNumberConstraints = {
    min?: number;
    max?: number;
    isInt: boolean;
};

/**
 * Zod's typeName is checked insted of instanceof to resolve Bun incomatibilities.
 */
export class ZodHelpers {
    static isZodType(i: ZodTypeAny): boolean {
        return ZodFirstPartyTypeKind[i?._def?.typeName as ZodFirstPartyTypeKind] !== undefined;
    }

    static isZodUnknown(i: ZodTypeAny): i is z.ZodUnknown {
        return (i?._def?.typeName as ZodFirstPartyTypeKind) === ZodFirstPartyTypeKind.ZodUnknown;
    }

    static isZodPipeline(i: ZodTypeAny): i is z.ZodPipeline<any, any> {
        return (i?._def?.typeName as ZodFirstPartyTypeKind) === ZodFirstPartyTypeKind.ZodPipeline;
    }

    /**
     * Wrappers that do not change the data model of their inner schema: `.default()`, `.catch()`,
     * `.readonly()`, `.brand()` and effects (`.refine()`, `.superRefine()`, `.transform()` and
     * `z.preprocess()`). The output type of a transformation cannot be known, so its input schema
     * is used.
     */
    static isZodTransparentWrapper(i: ZodTypeAny): boolean {
        const type = i?._def?.typeName as ZodFirstPartyTypeKind;
        return (
            type === ZodFirstPartyTypeKind.ZodDefault ||
            type === ZodFirstPartyTypeKind.ZodCatch ||
            type === ZodFirstPartyTypeKind.ZodReadonly ||
            type === ZodFirstPartyTypeKind.ZodBranded ||
            type === ZodFirstPartyTypeKind.ZodEffects
        );
    }

    /**
     * Returns the inner schema of a transparent wrapper.
     */
    static getWrappedSchema(i: ZodTypeAny): ZodTypeAny {
        const type = i._def.typeName as ZodFirstPartyTypeKind;

        if (type === ZodFirstPartyTypeKind.ZodBranded) {
            return i._def.type;
        } else if (type === ZodFirstPartyTypeKind.ZodEffects) {
            return i._def.schema;
        }

        return i._def.innerType;
    }

    /**
     * Returns the schema that represents the data model of a pipeline: its output side
     * (e.g. `z.string().pipe(z.coerce.number())`).
     */
    static getPipelineModelSchema(i: z.ZodPipeline<any, any>): ZodTypeAny {
        return i._def.out;
    }

    /**
     * Returns a short structural signature of a schema, used to tell apart two different schemas
     * that share the same type name.
     */
    static getShallowSignature(
        i: ZodTypeAny,
        resolve: (schema: ZodTypeAny) => IZod2xResolvedMetadata | undefined = resolveZod2xMetadata,
        depth = 0
    ): string {
        const typeName = resolve(i)?.typeName;
        if (typeName) {
            return `#${typeName}`;
        }

        const def = i?._def as any;
        const inner: ZodTypeAny | undefined =
            def?.innerType ?? (this.isZodType(def?.type) ? def.type : undefined) ?? def?.schema;
        return inner && depth < 5
            ? `${def.typeName}<${this.getShallowSignature(inner, resolve, depth + 1)}>`
            : `${def?.typeName}`;
    }

    static isZodAny(i: ZodTypeAny): i is z.ZodAny {
        return (i?._def?.typeName as ZodFirstPartyTypeKind) === ZodFirstPartyTypeKind.ZodAny;
    }

    static isZodString(i: ZodTypeAny): i is z.ZodString {
        return (i?._def?.typeName as ZodFirstPartyTypeKind) === ZodFirstPartyTypeKind.ZodString;
    }

    static isZodNumber(i: ZodTypeAny): i is z.ZodNumber {
        return (i?._def?.typeName as ZodFirstPartyTypeKind) === ZodFirstPartyTypeKind.ZodNumber;
    }

    static isZodBigInt(i: ZodTypeAny): i is z.ZodBigInt {
        return (i?._def?.typeName as ZodFirstPartyTypeKind) === ZodFirstPartyTypeKind.ZodBigInt;
    }

    static isZodLiteral(i: ZodTypeAny): i is z.ZodLiteral<any> {
        return (i?._def?.typeName as ZodFirstPartyTypeKind) === ZodFirstPartyTypeKind.ZodLiteral;
    }

    static isZodBoolean(i: ZodTypeAny): i is z.ZodBoolean {
        return (i?._def?.typeName as ZodFirstPartyTypeKind) === ZodFirstPartyTypeKind.ZodBoolean;
    }

    static isZodDate(i: ZodTypeAny): i is z.ZodDate {
        return (i?._def?.typeName as ZodFirstPartyTypeKind) === ZodFirstPartyTypeKind.ZodDate;
    }

    static isZodEnum(i: ZodTypeAny): i is ZodEnum<any> {
        return (i?._def?.typeName as ZodFirstPartyTypeKind) === ZodFirstPartyTypeKind.ZodEnum;
    }

    static isZodUnion(i: ZodTypeAny): i is z.ZodUnion<any> {
        return (i?._def?.typeName as ZodFirstPartyTypeKind) === ZodFirstPartyTypeKind.ZodUnion;
    }

    static isZodDiscriminatedUnion(i: ZodTypeAny): i is z.ZodDiscriminatedUnion<any, any> {
        return (
            (i?._def?.typeName as ZodFirstPartyTypeKind) ===
            ZodFirstPartyTypeKind.ZodDiscriminatedUnion
        );
    }

    static isZodNativeEnum(i: ZodTypeAny): i is ZodNativeEnum<any> {
        return (i?._def?.typeName as ZodFirstPartyTypeKind) === ZodFirstPartyTypeKind.ZodNativeEnum;
    }

    static isZodIntersection(i: ZodTypeAny): i is z.ZodIntersection<any, any> {
        return (
            (i?._def?.typeName as ZodFirstPartyTypeKind) === ZodFirstPartyTypeKind.ZodIntersection
        );
    }

    static isZodObject(i: ZodTypeAny): i is z.ZodObject<any> {
        return (i?._def?.typeName as ZodFirstPartyTypeKind) === ZodFirstPartyTypeKind.ZodObject;
    }

    static isZodLazy(i: ZodTypeAny): i is z.ZodLazy<any> {
        return (i?._def?.typeName as ZodFirstPartyTypeKind) === ZodFirstPartyTypeKind.ZodLazy;
    }

    static isZodRecord(i: ZodTypeAny): i is z.ZodRecord<any, any> {
        return (i?._def?.typeName as ZodFirstPartyTypeKind) === ZodFirstPartyTypeKind.ZodRecord;
    }

    static isZodMap(i: ZodTypeAny): i is z.ZodMap<any, any> {
        return (i?._def?.typeName as ZodFirstPartyTypeKind) === ZodFirstPartyTypeKind.ZodMap;
    }

    static isZodArray(i: ZodTypeAny): i is z.ZodArray<any> {
        return (i?._def?.typeName as ZodFirstPartyTypeKind) === ZodFirstPartyTypeKind.ZodArray;
    }

    static isZodSet(i: ZodTypeAny): i is z.ZodSet<any> {
        return (i?._def?.typeName as ZodFirstPartyTypeKind) === ZodFirstPartyTypeKind.ZodSet;
    }

    static isZodTuple(i: ZodTypeAny): i is z.ZodTuple<any> {
        return (i?._def?.typeName as ZodFirstPartyTypeKind) === ZodFirstPartyTypeKind.ZodTuple;
    }

    static isZodOptional(i: ZodTypeAny): i is z.ZodOptional<any> {
        return (i?._def?.typeName as ZodFirstPartyTypeKind) === ZodFirstPartyTypeKind.ZodOptional;
    }

    static isZodNullable(i: ZodTypeAny): i is z.ZodNullable<any> {
        return (i?._def?.typeName as ZodFirstPartyTypeKind) === ZodFirstPartyTypeKind.ZodNullable;
    }

    static isZodDefault(i: ZodTypeAny): i is z.ZodDefault<any> {
        return (i?._def?.typeName as ZodFirstPartyTypeKind) === ZodFirstPartyTypeKind.ZodDefault;
    }

    static isZodPromise(i: ZodTypeAny): i is z.ZodPromise<any> {
        return (i?._def?.typeName as ZodFirstPartyTypeKind) === ZodFirstPartyTypeKind.ZodPromise;
    }

    static isZodAnyUnionType(i: ZodTypeAny) {
        return this.isZodUnion(i) || this.isZodDiscriminatedUnion(i);
    }

    static isZodAnyEnumType(i: ZodTypeAny) {
        return this.isZodEnum(i) || this.isZodNativeEnum(i);
    }

    static isZodAnyNumberType(i: ZodTypeAny) {
        return this.isZodNumber(i) || this.isZodBigInt(i);
    }

    static isZodAnyMapType(i: ZodTypeAny) {
        return this.isZodMap(i) || this.isZodRecord(i);
    }

    /**
     * Complex types that shall always be transpiled, which output would be a type, or alias if
     * redefined using layered modeling.
     * @param zodType
     * @returns
     */
    static isTranspilerableZodType(zodType: string | ZodTypeAny): boolean {
        const type = typeof zodType === "string" ? zodType : zodType?._def?.typeName;

        return (
            type === ZodFirstPartyTypeKind.ZodEnum ||
            type === ZodFirstPartyTypeKind.ZodNativeEnum ||
            type === ZodFirstPartyTypeKind.ZodObject ||
            type === ZodFirstPartyTypeKind.ZodUnion ||
            type === ZodFirstPartyTypeKind.ZodDiscriminatedUnion ||
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
    static isTranspilerableAliasedZodType(
        zodType: string | ZodTypeAny,
        onlyArray = false
    ): boolean {
        const type = typeof zodType === "string" ? zodType : zodType?._def?.typeName;

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
     * Zod2X generics are represented as Promise<"TypeName">.
     * Ex: z.promise(z.literal("K")) will be transpiled to Template<K>
     */
    static isZod2XGeneric(i: ZodTypeAny): boolean {
        return (
            this.isZodPromise(i) &&
            this.isZodLiteral(i._def.type) &&
            typeof i._def.type._def.value === "string"
        );
    }

    /**
     * Creates a new instance of the schema with the same definition. It inherits the zod2x
     * metadata of the original schema unless it has its own.
     */
    static cloneZod(i: ZodTypeAny) {
        const zodType: ZodFirstPartyTypeKind = i._def.typeName;
        return linkToSource(new (Extended.getZ()[zodType] as any)({ ...i._def }), i);
    }

    static createZodObject(properties: Map<string, ZodTypeAny>): ZodObject<any> {
        return Extended.getZ().object(Object.fromEntries(properties));
    }

    static getZodNumberConstraints(i: ZodNumber | z.ZodBigInt): ZodNumberConstraints {
        const constraints: ZodNumberConstraints = { isInt: this.isZodBigInt(i) };

        if (i._def.checks) {
            for (const check of i._def.checks) {
                if (check.kind === "min") {
                    constraints.min = check.value as number;
                } else if (check.kind === "max") {
                    constraints.max = check.value as number;
                } else if (check.kind === "int") {
                    constraints.isInt = true;
                }
            }
        }

        return constraints;
    }
}

export function createGenericType(name: string) {
    return Extended.getZ().promise(Extended.getZ().literal(name));
}

/**
 * Use generic types defined in a generic ZodObject by replacing them with the actual child types.
 * The new type references the generic type and the child types used for each template, so its
 * type name, layer and templates translation are resolved from them when transpiled.
 * @param genObj ZodObject with generic types.
 * @param childrens Record of child types to replace generics.
 * @returns The extended ZodObject with replaced generic types.
 */
export function useGenericType(
    genObj: ZodObject<any>,
    childrens: Record<string, ZodTypeAny>,
    skipLazy: true
): ZodObject<any>;
export function useGenericType(
    genObj: ZodObject<any>,
    childrens: Record<string, ZodTypeAny>,
    skipLazy?: false
): z.ZodLazy<ZodObject<any>>;
export function useGenericType(
    genObj: ZodObject<any>,
    childrens: Record<string, ZodTypeAny>,
    skipLazy?: boolean
): ZodObject<any> | z.ZodLazy<ZodObject<any>> {
    const builder = () => {
        let extended = genObj;
        const templates: [string, ZodTypeAny][] = [];

        for (const [key, property] of Object.entries<ZodTypeAny>(genObj.shape)) {
            if (ZodHelpers.isZod2XGeneric(property)) {
                const childType = childrens[key];
                if (!childType) {
                    throw new Error(
                        `Missing child type for generic property ${key} in ` +
                            `${resolveZod2xMetadata(genObj)?.typeName}.`
                    );
                }
                extended = extended.extend({ [key]: childType });
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
