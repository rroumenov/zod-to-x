import { z, ZodTypeAny } from "zod";
import { extendZod } from "../../dist";
extendZod(z);

enum NativeEnumItem {
    NativeEnum1 = 1,
    NativeEnum2 = 2,
    NativeEnum3 = "NativeEnum3",
}

/**
 * Schemas generator is used to avoid schema interferences between tests
 * @returns Schemas for testing
 */
export const getSchemas = () => {
    // Strings
    const zString = z.string();

    // Literals
    const zLiteralString = z.literal("literal");
    const zLiteralNumber = z.literal(1);

    // Enumerates
    const zEnum = z.enum(["Enum1", "Enum2", "Enum3"]).zod2x("EnumItem");

    const zNativeEnum = z.nativeEnum(NativeEnumItem).zod2x("NativeEnumItem");

    // Numbers
    const zDouble = z.number();
    const zBigInt = z.bigint();
    const zInt64 = z.number().int();
    const zInt32 = z.number().int().max(2147483647).min(-2147483648);

    // Booleans
    const zBoolean = z.boolean();

    // Objects
    const zObject = z
        .object({
            key: zString,
        })
        .zod2x("ObjectItem");

    const zOtherObject = z
        .object({
            otherKey: zString,
        })
        .zod2x("OtherObjectItem");

    const zObjectWithDiscriminator = z
        .object({
            key: zString,
            discriminator: z.literal(zEnum.Values.Enum1).zod2x(zEnum),
        })
        .zod2x("ObjectItemWithDiscriminator");

    const zOtherObjectWithDiscriminator = z
        .object({
            otherKey: zString,
            discriminator: z.literal(zEnum.Values.Enum2).zod2x(zEnum),
        })
        .zod2x("OtherObjectItemWithDiscriminator");

    // Dates
    const zDate = z.date();

    // Arrays
    const zArray1D = z.array(zDouble);
    const zArray2D = z.array(z.array(zDouble));

    // Complex types
    const zRecord = z.record(zDouble);
    const zMap = z.map(zString, zDouble);
    const zSet = z.set(zString);
    const zTuple = z.tuple([zDouble, zDouble]);
    const zTupleMulti = z.tuple([zDouble, zString, zBoolean]);

    const zIntersection = z.intersection(zObject, zOtherObject).zod2x("IntersectionItem");
    const zUnion = z.union([zObject, zOtherObject]).zod2x("UnionItem");
    const zDiscriminantUnion = z
        .discriminatedUnion("discriminator", [
            zObjectWithDiscriminator,
            zOtherObjectWithDiscriminator,
        ])
        .zod2x("DiscriminatedUnionItem");

    // Special types
    const zAny = z.any();
    const zOptional = z.optional(zString);
    const zNullable = z.nullable(zString);

    return {
        zString,
        zLiteralString,
        zLiteralNumber,
        zEnum,
        zNativeEnum,
        zDouble,
        zBigInt,
        zInt64,
        zInt32,
        zBoolean,
        zObject,
        zOtherObject,
        zObjectWithDiscriminator,
        zOtherObjectWithDiscriminator,
        zDate,
        zArray1D,
        zArray2D,
        zRecord,
        zMap,
        zSet,
        zTuple,
        zTupleMulti,
        zIntersection,
        zUnion,
        zDiscriminantUnion,
        zAny,
        zOptional,
        zNullable,
    };
};

// Model builder for testing
export const modelBuilder = (schema: ZodTypeAny) => z.object({ item: schema }).zod2x("ModelItem");
