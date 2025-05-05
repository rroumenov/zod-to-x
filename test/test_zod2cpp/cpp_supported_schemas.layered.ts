import { z } from "zod";
import { Application, Domain, Zod2XModel } from "../../dist";
import { getCppSupportedSchemas } from "./cpp_supported_schemas";

const cppSupportedSchemas = getCppSupportedSchemas();

@Domain({ namespace: "CPP_SUPPORTED_SCHEMAS", file: "cpp_supported_schemas.entity" })
class CppSupportedSchemas extends Zod2XModel {
    stringItem = cppSupportedSchemas.stringItem;

    literalStringItem = cppSupportedSchemas.literalStringItem;
    literalNumberItem = cppSupportedSchemas.literalNumberItem;

    enumItem = cppSupportedSchemas.enumItem;
    nativeEnumItem = cppSupportedSchemas.nativeEnumItem;

    doubleItem = cppSupportedSchemas.doubleItem;
    bigIntItem = cppSupportedSchemas.bigIntItem;
    int64Item = cppSupportedSchemas.int64Item;
    int32Item = cppSupportedSchemas.int32Item;

    booleanItem = cppSupportedSchemas.booleanItem;

    objectItem = cppSupportedSchemas.objectItem;
    otherObjectItem = z
        .object({
            otherKey: this.stringItem,
        })
        .zod2x("OtherObjectItem");
    objectItemWithDiscriminator = z
        .object({
            key: this.stringItem,
            discriminator: z.literal(this.enumItem.Values.Enum1).zod2x(this.enumItem),
        })
        .zod2x("ObjectItemWithDiscriminator");
    otherObjectItemWithDiscriminator = z
        .object({
            otherKey: this.stringItem,
            discriminator: z.literal(this.enumItem.Values.Enum2).zod2x(this.enumItem),
        })
        .zod2x("OtherObjectItemWithDiscriminator");

    arrayItem = cppSupportedSchemas.arrayItem;

    recordItem = cppSupportedSchemas.recordItem;
    mapItem = cppSupportedSchemas.mapItem;
    setItem = cppSupportedSchemas.setItem;
    tupleItem = cppSupportedSchemas.tupleItem;

    unionItem = z.union([this.objectItem, this.otherObjectItem]);
    discriminatedUnionItem = z.discriminatedUnion("discriminator", [
        this.objectItemWithDiscriminator,
        this.otherObjectItemWithDiscriminator,
    ]);
    intersectionItem = z.intersection(this.objectItem, this.otherObjectItem);

    anyItem = cppSupportedSchemas.anyItem;
    optionalItem = cppSupportedSchemas.optionalItem;
    nullableItem = cppSupportedSchemas.nullableItem;
}

export const cppSupportedSchemasModel = new CppSupportedSchemas();

@Application({ namespace: "CPP_SUPPORTED_SCHEMAS_APP", file: "cpp_supported_schemas.app" })
class CppSupportedSchemasApplication extends Zod2XModel {
    newStringItem = cppSupportedSchemasModel.stringItem;

    newLiteralStringItem = cppSupportedSchemasModel.literalStringItem;
    newLiteralNumberItem = cppSupportedSchemasModel.literalNumberItem;

    newEnumItem = cppSupportedSchemasModel.enumItem;
    newNativeEnumItem = cppSupportedSchemasModel.nativeEnumItem;

    newDoubleItem = cppSupportedSchemasModel.doubleItem;
    newBigIntItem = cppSupportedSchemasModel.bigIntItem;
    newInt64Item = cppSupportedSchemasModel.int64Item;
    newInt32Item = cppSupportedSchemasModel.int32Item;

    newBooleanItem = cppSupportedSchemasModel.booleanItem;

    newObjectItem = cppSupportedSchemasModel.objectItem;

    newArrayItem = cppSupportedSchemasModel.arrayItem;

    newRecordItem = cppSupportedSchemasModel.recordItem;
    newMapItem = cppSupportedSchemasModel.mapItem;
    newSetItem = cppSupportedSchemasModel.setItem;
    newTupleItem = cppSupportedSchemasModel.tupleItem;

    newUnionItem = cppSupportedSchemasModel.unionItem;
    newDiscriminatedUnionItem = cppSupportedSchemasModel.discriminatedUnionItem;
    newIntersectionItem = cppSupportedSchemasModel.intersectionItem;

    newAnyItem = cppSupportedSchemasModel.anyItem;
    newOptionalItem = cppSupportedSchemasModel.optionalItem;
    newNullableItem = cppSupportedSchemasModel.nullableItem;
}

export const cppSupportedSchemasApplicationModel = new CppSupportedSchemasApplication();
