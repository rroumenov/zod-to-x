import { z } from "zod";
import * as zs from "../common/zod_schemas";

export const zTsSupportedSchemas = z
    .object({
        stringItem: zs.zString,

        literalStringItem: zs.zLiteralString,
        literalNumberItem: zs.zLiteralNumber,

        enumItem: zs.zEnum,
        nativeEnumItem: zs.zNativeEnum,

        doubleItem: zs.zDouble,
        bigIntItem: zs.zBigInt,
        int64Item: zs.zInt64,
        int32Item: zs.zInt32,

        booleanItem: zs.zBoolean,

        objectItem: zs.zObject,

        dateItem: zs.zDate,

        arrayItem: zs.zArray2D,

        recordItem: zs.zRecord,
        mapItem: zs.zMap,
        setItem: zs.zSet,
        tupleItem: zs.zTupleMulti,

        unionItem: zs.zUnionWithDef,
        discriminatedUnionItem: zs.zDiscriminantUnionWithDef,
        unionItemComposite: zs.zUnion,

        intersectionItem: zs.zIntersectionWithDef,
        intersectionItemComposite: zs.zIntersection,

        anyItem: zs.zAny,
        optionalItem: zs.zOptional,
        nullableItem: zs.zNullable,
    })
    .zod2x("TsSupportedSchemas");
