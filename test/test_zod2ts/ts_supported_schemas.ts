import { z } from "zod/v4";
import { getSchemas } from "../common/zod_schemas";

export const getTsSupportedSchemas = () => {
    const zs = getSchemas();

    return {
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

        unionItem: zs.zUnion,
        discriminatedUnionItem: zs.zDiscriminantUnion,

        intersectionItem: zs.zIntersection,

        anyItem: zs.zAny,
        optionalItem: zs.zOptional,
        nullableItem: zs.zNullable,
    };
};

export const zTsSupportedSchemas = z.object(getTsSupportedSchemas()).zod2x("TsSupportedSchemas");
