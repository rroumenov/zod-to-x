import { z } from "zod";
import { Application, Domain, Zod2XModel } from "../../dist";
import { getDartSupportedSchemas } from "./dart_supported_schemas";

const dartSupportedSchemas = getDartSupportedSchemas();

@Domain({
    namespace: "DART_SUPPORTED_SCHEMAS",
    file: "dart_supported_schemas_entity",
    skipLayerInterface: false,
})
class DartSupportedSchemas extends Zod2XModel {
    stringItem = dartSupportedSchemas.stringItem;

    literalStringItem = dartSupportedSchemas.literalStringItem;
    literalNumberItem = dartSupportedSchemas.literalNumberItem;

    enumItem = dartSupportedSchemas.enumItem;
    nativeEnumItem = dartSupportedSchemas.nativeEnumItem;

    doubleItem = dartSupportedSchemas.doubleItem;
    bigIntItem = dartSupportedSchemas.bigIntItem;
    int64Item = dartSupportedSchemas.int64Item;
    int32Item = dartSupportedSchemas.int32Item;

    booleanItem = dartSupportedSchemas.booleanItem;

    objectItem = dartSupportedSchemas.objectItem;
    otherObjectItem = z
        .object({
            otherKey: z.string(),
        })
        .describe("Other Object Item")
        .zod2x("OtherObjectItem");
    objectItemWithDiscriminator = z
        .object({
            key: z.string(),
            discriminator: z.literal(this.enumItem.Values.Enum1).zod2x(this.enumItem),
        })
        .describe("Object Item With Discriminator")
        .zod2x("ObjectItemWithDiscriminator");
    otherObjectItemWithDiscriminator = z
        .object({
            otherKey: z.string(),
            discriminator: z.literal(this.enumItem.Values.Enum2).zod2x(this.enumItem),
        })
        .describe("Other Object Item With Discriminator")
        .zod2x("OtherObjectItemWithDiscriminator");

    dateItem = dartSupportedSchemas.dateItem;

    arrayItem = dartSupportedSchemas.arrayItem;

    recordItem = dartSupportedSchemas.recordItem;
    mapItem = dartSupportedSchemas.mapItem;
    setItem = dartSupportedSchemas.setItem;
    tupleItem = dartSupportedSchemas.tupleItem;

    unionItem = z.union([this.objectItem, this.otherObjectItem]).describe("Union Item");
    discriminatedUnionItem = z
        .discriminatedUnion("discriminator", [
            this.objectItemWithDiscriminator,
            this.otherObjectItemWithDiscriminator,
        ])
        .describe("Discriminated Union Item");
    intersectionItem = z
        .intersection(this.objectItem, this.otherObjectItem)
        .describe("Intersection Item");

    anyItem = dartSupportedSchemas.anyItem;
    optionalItem = dartSupportedSchemas.optionalItem;
    nullableItem = dartSupportedSchemas.nullableItem;
}

export const dartSupportedSchemasModel = new DartSupportedSchemas();

@Application({
    namespace: "DART_SUPPORTED_SCHEMAS_APP",
    file: "dart_supported_schemas_app",
    skipLayerInterface: false,
})
class DartSupportedSchemasApplication extends Zod2XModel {
    newStringItem = dartSupportedSchemasModel.stringItem;

    newLiteralStringItem = dartSupportedSchemasModel.literalStringItem;
    newLiteralNumberItem = dartSupportedSchemasModel.literalNumberItem;

    newEnumItem = dartSupportedSchemasModel.enumItem;
    newNativeEnumItem = dartSupportedSchemasModel.nativeEnumItem;

    newDoubleItem = dartSupportedSchemasModel.doubleItem;
    newBigIntItem = dartSupportedSchemasModel.bigIntItem;
    newInt64Item = dartSupportedSchemasModel.int64Item;
    newInt32Item = dartSupportedSchemasModel.int32Item;

    newBooleanItem = dartSupportedSchemasModel.booleanItem;

    newObjectItem = dartSupportedSchemasModel.objectItem;

    newDateItem = dartSupportedSchemasModel.dateItem;

    newArrayItem = dartSupportedSchemasModel.arrayItem;

    newRecordItem = dartSupportedSchemasModel.recordItem;
    newMapItem = dartSupportedSchemasModel.mapItem;
    newSetItem = dartSupportedSchemasModel.setItem;
    newTupleItem = dartSupportedSchemasModel.tupleItem;

    newUnionItem = dartSupportedSchemasModel.unionItem;
    newDiscriminatedUnionItem = dartSupportedSchemasModel.discriminatedUnionItem;
    newIntersectionItem = dartSupportedSchemasModel.intersectionItem;

    newAnyItem = dartSupportedSchemasModel.anyItem;
    newOptionalItem = dartSupportedSchemasModel.optionalItem;
    newNullableItem = dartSupportedSchemasModel.nullableItem;
}

export const dartSupportedSchemasApplicationModel = new DartSupportedSchemasApplication();
