import { z, ZodEnum, ZodNumber, ZodObject, ZodType } from "zod/v4";

import { Extended } from "./zod_ext";

export type { ZodArray, ZodType, ZodIntersection, ZodObject, ZodEnum } from "zod/v4";
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
}

/**
 * Zod's type is checked insted of instanceof to resolve Bun incomatibilities.
 */
export class ZodHelpers {
    static isZodType(i: ZodType): boolean {
        return Object.values(ZodFirstPartyTypeKind).includes(i?.def?.type as ZodFirstPartyTypeKind);
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
            (i as z.ZodDiscriminatedUnion).def.discriminator === undefined
        );
    }

    static isZodDiscriminatedUnion(i: ZodType): i is z.ZodDiscriminatedUnion {
        return (
            i?.def?.type === ZodFirstPartyTypeKind.ZodUnion &&
            (i as z.ZodDiscriminatedUnion).def.discriminator !== undefined
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

    static cloneZod(i: ZodType) {
        return i.meta({ ...(i.meta() || {}) });
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
