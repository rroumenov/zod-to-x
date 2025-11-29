import {
    z,
    ZodEnum,
    ZodFirstPartyTypeKind,
    ZodNativeEnum,
    ZodNumber,
    ZodObject,
    ZodTypeAny,
} from "zod";

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

    static cloneZod(i: ZodTypeAny) {
        const zodType: ZodFirstPartyTypeKind = i._def.typeName;
        return new (Extended.getZ()[zodType] as any)({ ...i._def });
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
 * It preserves the zod2x metadata including the genericTypes array which will be moved to the
 * new type during layer modeling metadata assignment.
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
        for (const [key, property] of Object.entries<ZodTypeAny>(genObj.shape)) {
            if (ZodHelpers.isZod2XGeneric(property)) {
                const childType = childrens[key];
                if (!childType) {
                    throw new Error(
                        `Missing child type for generic property ${key} in ${genObj._zod2x!.typeName}.`
                    );
                }
                const zod2xMeta = structuredClone(extended._zod2x);
                extended = extended.extend({ [key]: childType });
                extended._zod2x = zod2xMeta;
                extended._zod2x!.isGenericChild = false;

                if (!Array.isArray(extended._zod2x!.genericTypes)) {
                    extended._zod2x!.genericTypes = [];
                }

                if (childType._zod2x !== undefined) {
                    extended._zod2x!.genericTypes!.push({
                        typeName: childType._zod2x.typeName,
                        layer: childType._zod2x.layer!,
                    });
                }
            }
        }
        return extended;
    };

    return skipLazy ? builder() : z.lazy(builder);
}
