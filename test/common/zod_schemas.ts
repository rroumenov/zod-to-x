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
    const zString = z.string().describe("A simple string");

    // Literals
    const zLiteralString = z.literal("literal").describe("A literal string");
    const zLiteralNumber = z.literal(1).describe("A literal number");

    // Enumerates
    const zEnum = z.enum(["Enum1", "Enum2", "Enum3"]).describe("An enum").zod2x("EnumItem");

    const zNativeEnum = z
        .nativeEnum(NativeEnumItem)
        .describe("A native enum")
        .zod2x("NativeEnumItem");

    // Numbers
    const zDouble = z.number().describe("A double");
    const zBigInt = z.bigint().describe("A big integer");
    const zInt64 = z.number().int().describe("A 64-bit integer");
    const zInt32 = z.number().int().max(2147483647).min(-2147483648).describe("A 32-bit integer");

    // Booleans
    const zBoolean = z.boolean().describe("A boolean");

    // Objects
    const zObject = z
        .object({
            key: z.string(),
        })
        .describe("An object")
        .zod2x("ObjectItem");

    const zOtherObject = z
        .object({
            otherKey: z.string(),
        })
        .describe("Another object")
        .zod2x("OtherObjectItem");

    const zObjectWithDiscriminator = z
        .object({
            key: z.string(),
            discriminator: z.literal(zEnum.Values.Enum1).zod2x(zEnum),
        })
        .describe("An object with a discriminator")
        .zod2x("ObjectItemWithDiscriminator");

    const zOtherObjectWithDiscriminator = z
        .object({
            otherKey: z.string(),
            discriminator: z.literal(zEnum.Values.Enum2).zod2x(zEnum),
        })
        .describe("Another object with a discriminator")
        .zod2x("OtherObjectItemWithDiscriminator");

    // Dates
    const zDate = z.date().describe("A date");

    // Arrays
    const zArray1D = z.array(z.number()).describe("A one-dimensional array of numbers");
    const zArray2D = z.array(z.array(z.number())).describe("A two-dimensional array of numbers");

    // Complex types
    const zRecord = z.record(z.number()).describe("A record with string keys and number values");
    const zMap = z.map(z.string(), z.number()).describe("A map with string keys and number values");
    const zSet = z.set(z.string()).describe("A set of strings");
    const zTuple = z.tuple([z.number(), z.number()]).describe("A tuple of two numbers");
    const zTupleMulti = z
        .tuple([z.number(), z.string(), z.boolean()])
        .describe("A tuple of a number, a string, and a boolean");

    const zIntersection = z
        .intersection(zObject, zOtherObject)
        .describe("An intersection of two objects")
        .zod2x("IntersectionItem");
    const zUnion = z
        .union([zObject, zOtherObject])
        .describe("A union of two objects")
        .zod2x("UnionItem");
    const zDiscriminantUnion = z
        .discriminatedUnion("discriminator", [
            zObjectWithDiscriminator,
            zOtherObjectWithDiscriminator,
        ])
        .describe("A discriminated union of two objects")
        .zod2x("DiscriminatedUnionItem");

    // Special types
    const zAny = z.any().describe("Any type");
    const zOptional = z.optional(z.string()).describe("An optional string");
    const zNullable = z.nullable(z.string()).describe("A nullable string");

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
