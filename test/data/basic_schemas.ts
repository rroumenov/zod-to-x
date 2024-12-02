import { z } from "zod";

const ZodEnum = z.enum(["Item1", "Item2"]).zod2x("MyEnumType");

enum nativeEnum {
    "Item3" = 0,
    "Item4" = 1
}

const ZodNativeEnum = z.nativeEnum(nativeEnum).zod2x("MyNativeEnumType");

const ZodMyObj = z.object({
    att1: z.string()
}).zod2x("MyObjType");

export const BasicTypes = z.object({
    stringItem: z.string(),
    numberItem: z.number(),
    boolItem: z.boolean(),
    enumItem: ZodEnum,
    nativeEnumItem: ZodNativeEnum,
    literalItem: z.literal("ImLiteral"),
    anyItem: z.any(),
    dateItem: z.date(),
    setItem: z.set(z.number()),
    arrayItem: z.array(z.string()),
    myObj: ZodMyObj
}).zod2x("MyBasicTypes");