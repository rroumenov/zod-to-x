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

export class ZodHelpers {
    static isZodType(i: ZodTypeAny): boolean {
        return i instanceof Extended.getZ().ZodType;
    }

    static isZodAny(i: ZodTypeAny): i is z.ZodAny {
        return i instanceof Extended.getZ().ZodAny;
    }

    static isZodString(i: ZodTypeAny): i is z.ZodString {
        return i instanceof Extended.getZ().ZodString;
    }

    static isZodNumber(i: ZodTypeAny): i is z.ZodNumber {
        return i instanceof Extended.getZ().ZodNumber;
    }

    static isZodBigInt(i: ZodTypeAny): i is z.ZodBigInt {
        return i instanceof Extended.getZ().ZodBigInt;
    }

    static isZodLiteral(i: ZodTypeAny): i is z.ZodLiteral<any> {
        return i instanceof Extended.getZ().ZodLiteral;
    }

    static isZodBoolean(i: ZodTypeAny): i is z.ZodBoolean {
        return i instanceof Extended.getZ().ZodBoolean;
    }

    static isZodDate(i: ZodTypeAny): i is z.ZodDate {
        return i instanceof Extended.getZ().ZodDate;
    }

    static isZodEnum(i: ZodTypeAny): i is ZodEnum<any> {
        return i instanceof Extended.getZ().ZodEnum;
    }

    static isZodUnion(i: ZodTypeAny): i is z.ZodUnion<any> {
        return i instanceof Extended.getZ().ZodUnion;
    }

    static isZodDiscriminatedUnion(i: ZodTypeAny): i is z.ZodDiscriminatedUnion<any, any> {
        return i instanceof Extended.getZ().ZodDiscriminatedUnion;
    }

    static isZodNativeEnum(i: ZodTypeAny): i is ZodNativeEnum<any> {
        return i instanceof Extended.getZ().ZodNativeEnum;
    }

    static isZodIntersection(i: ZodTypeAny): i is z.ZodIntersection<any, any> {
        return i instanceof Extended.getZ().ZodIntersection;
    }

    static isZodObject(i: ZodTypeAny): i is z.ZodObject<any> {
        return i instanceof Extended.getZ().ZodObject;
    }

    static isZodLazy(i: ZodTypeAny): i is z.ZodLazy<any> {
        return i instanceof Extended.getZ().ZodLazy;
    }

    static isZodRecord(i: ZodTypeAny): i is z.ZodRecord<any, any> {
        return i instanceof Extended.getZ().ZodRecord;
    }

    static isZodMap(i: ZodTypeAny): i is z.ZodMap<any, any> {
        return i instanceof Extended.getZ().ZodMap;
    }

    static isZodArray(i: ZodTypeAny): i is z.ZodArray<any> {
        return i instanceof Extended.getZ().ZodArray;
    }

    static isZodSet(i: ZodTypeAny): i is z.ZodSet<any> {
        return i instanceof Extended.getZ().ZodSet;
    }

    static isZodTuple(i: ZodTypeAny): i is z.ZodTuple<any> {
        return i instanceof Extended.getZ().ZodTuple;
    }

    static isZodOptional(i: ZodTypeAny): i is z.ZodOptional<any> {
        return i instanceof Extended.getZ().ZodOptional;
    }

    static isZodNullable(i: ZodTypeAny): i is z.ZodNullable<any> {
        return i instanceof Extended.getZ().ZodNullable;
    }

    static isZodDefault(i: ZodTypeAny): i is z.ZodDefault<any> {
        return i instanceof Extended.getZ().ZodDefault;
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
