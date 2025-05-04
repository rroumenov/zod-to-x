import {
    z,
    ZodEnum,
    ZodFirstPartyTypeKind,
    ZodNativeEnum,
    ZodNumber,
    ZodObject,
    ZodTypeAny,
} from "zod";

export type { ZodTypeAny, ZodIntersection, ZodObject } from "zod";
export type ZodAnyEnumType = ZodEnum<any> | ZodNativeEnum<any>;
export type ZodAnyUnionType = z.ZodUnion<any> | z.ZodDiscriminatedUnion<any, any>;

type ZodNumberConstraints = {
    min?: number;
    max?: number;
    isInt: boolean;
};

export class ZodHelpers {
    static isZodType(i: ZodTypeAny): boolean {
        return i instanceof z.ZodType;
    }

    static isZodAny(i: ZodTypeAny): i is z.ZodAny {
        return i instanceof z.ZodAny;
    }

    static isZodString(i: ZodTypeAny): i is z.ZodString {
        return i instanceof z.ZodString;
    }

    static isZodNumber(i: ZodTypeAny): i is z.ZodNumber {
        return i instanceof z.ZodNumber;
    }

    static isZodBigInt(i: ZodTypeAny): i is z.ZodBigInt {
        return i instanceof z.ZodBigInt;
    }

    static isZodLiteral(i: ZodTypeAny): i is z.ZodLiteral<any> {
        return i instanceof z.ZodLiteral;
    }

    static isZodBoolean(i: ZodTypeAny): i is z.ZodBoolean {
        return i instanceof z.ZodBoolean;
    }

    static isZodDate(i: ZodTypeAny): i is z.ZodDate {
        return i instanceof z.ZodDate;
    }

    static isZodEnum(i: ZodTypeAny): i is ZodEnum<any> {
        return i instanceof z.ZodEnum;
    }

    static isZodUnion(i: ZodTypeAny): i is z.ZodUnion<any> {
        return i instanceof z.ZodUnion;
    }

    static isZodDiscriminatedUnion(i: ZodTypeAny): i is z.ZodDiscriminatedUnion<any, any> {
        return i instanceof z.ZodDiscriminatedUnion;
    }

    static isZodNativeEnum(i: ZodTypeAny): i is ZodNativeEnum<any> {
        return i instanceof z.ZodNativeEnum;
    }

    static isZodIntersection(i: ZodTypeAny): i is z.ZodIntersection<any, any> {
        return i instanceof z.ZodIntersection;
    }

    static isZodObject(i: ZodTypeAny): i is z.ZodObject<any> {
        return i instanceof z.ZodObject;
    }

    static isZodLazy(i: ZodTypeAny): i is z.ZodLazy<any> {
        return i instanceof z.ZodLazy;
    }

    static isZodRecord(i: ZodTypeAny): i is z.ZodRecord<any, any> {
        return i instanceof z.ZodRecord;
    }

    static isZodMap(i: ZodTypeAny): i is z.ZodMap<any, any> {
        return i instanceof z.ZodMap;
    }

    static isZodArray(i: ZodTypeAny): i is z.ZodArray<any> {
        return i instanceof z.ZodArray;
    }

    static isZodSet(i: ZodTypeAny): i is z.ZodSet<any> {
        return i instanceof z.ZodSet;
    }

    static isZodTuple(i: ZodTypeAny): i is z.ZodTuple<any> {
        return i instanceof z.ZodTuple;
    }

    static isZodOptional(i: ZodTypeAny): i is z.ZodOptional<any> {
        return i instanceof z.ZodOptional;
    }

    static isZodNullable(i: ZodTypeAny): i is z.ZodNullable<any> {
        return i instanceof z.ZodNullable;
    }

    static isZodDefault(i: ZodTypeAny): i is z.ZodDefault<any> {
        return i instanceof z.ZodDefault;
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

    static cloneZod(i: ZodTypeAny) {
        const zodType: ZodFirstPartyTypeKind = i._def.typeName;
        return new (z[zodType] as any)({ ...i._def });
    }

    static createZodObject(properties: Map<string, ZodTypeAny>): ZodObject<any> {
        return z.object(Object.fromEntries(properties));
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
