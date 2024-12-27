import { z, ZodTypeAny } from "zod";
import { extendZod } from "../../dist";
extendZod(z);

// Strings
export const zString = z.string();

// Literals
export const zLiteralString = z.literal("literal");
export const zLiteralNumber = z.literal(1);

// Enumerates
export const zEnum = z.enum(["Enum1", "Enum2", "Enum3"]).zod2x("EnumItem");

export enum NativeEnumItem {
    NativeEnum1 = 1,
    NativeEnum2 = 2,
    NativeEnum3 = "NativeEnum3",
}

export const zNativeEnum = z.nativeEnum(NativeEnumItem).zod2x("NativeEnumItem");

// Numbers
export const zDouble = z.number();
export const zBigInt = z.bigint();
export const zInt64 = z.number().int();
export const zInt32 = z.number().int().max(2147483647).min(-2147483648);

// Booleans
export const zBoolean = z.boolean();

// Objects
export const zObject = z
    .object({
        key: zString,
        discriminator: z.literal("optionA"),
    })
    .zod2x("ObjectItem");

export const zOtherObject = z
    .object({
        key: zString,
        otherKey: zString,
        discriminator: z.literal("optionB"),
    })
    .zod2x("OtherObjectItem");

// Dates
export const zDate = z.date();

// Arrays
export const zArray1D = z.array(zDouble);
export const zArray2D = z.array(z.array(zDouble));

// Complex types
export const zRecord = z.record(zDouble);
export const zMap = z.map(zString, zDouble);
export const zSet = z.set(zString);
export const zTuple = z.tuple([zDouble, zDouble]);
export const zTupleMulti = z.tuple([zDouble, zString, zBoolean]);
export const zUnion = z.union([zObject, zOtherObject]);
export const zUnionWithDef = z.union([zObject, zOtherObject]).zod2x("UnionItem");

export const zDiscriminantUnion = z.discriminatedUnion("discriminator", [zObject, zOtherObject]);
export const zDiscriminantUnionWithDef = z
    .discriminatedUnion("discriminator", [zObject, zOtherObject])
    .zod2x("DiscriminantUnionItem");

export const zIntersection = z.intersection(zObject, zOtherObject);
export const zIntersectionWithDef = z.intersection(zObject, zOtherObject).zod2x("IntersectionItem");

// Special types
export const zAny = z.any();
export const zOptional = z.optional(zString);
export const zNullable = z.nullable(zString);

// Model builder for testing
export const modelBuilder = (schema: ZodTypeAny) => z.object({ item: schema }).zod2x("ModelItem");
