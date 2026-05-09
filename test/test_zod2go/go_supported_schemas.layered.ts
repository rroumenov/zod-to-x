import { z } from "zod";
import { Application, Domain, Zod2XModel } from "../../dist";
import { getGoSupportedSchemas } from "./go_supported_schemas";

const goSupportedSchemas = getGoSupportedSchemas();

@Domain({
    namespace: "GO_SUPPORTED_SCHEMAS",
    file: "go_supported_schemas_entity",
    skipLayerInterface: false,
})
class GoSupportedSchemas extends Zod2XModel {
    stringItem = goSupportedSchemas.stringItem;

    literalStringItem = goSupportedSchemas.literalStringItem;
    literalNumberItem = goSupportedSchemas.literalNumberItem;

    enumItem = goSupportedSchemas.enumItem;
    nativeEnumItem = goSupportedSchemas.nativeEnumItem;

    doubleItem = goSupportedSchemas.doubleItem;
    bigIntItem = goSupportedSchemas.bigIntItem;
    int64Item = goSupportedSchemas.int64Item;
    int32Item = goSupportedSchemas.int32Item;

    booleanItem = goSupportedSchemas.booleanItem;

    objectItem = goSupportedSchemas.objectItem;
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

    dateItem = goSupportedSchemas.dateItem;

    arrayItem = goSupportedSchemas.arrayItem;

    recordItem = goSupportedSchemas.recordItem;
    mapItem = goSupportedSchemas.mapItem;
    setItem = goSupportedSchemas.setItem;
    tupleItem = goSupportedSchemas.tupleItem;

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

    anyItem = goSupportedSchemas.anyItem;
    optionalItem = goSupportedSchemas.optionalItem;
    nullableItem = goSupportedSchemas.nullableItem;
}

export const goSupportedSchemasModel = new GoSupportedSchemas();

@Application({
    namespace: "GO_SUPPORTED_SCHEMAS_APP",
    file: "go_supported_schemas_app",
    skipLayerInterface: false,
})
class GoSupportedSchemasApplication extends Zod2XModel {
    newStringItem = goSupportedSchemasModel.stringItem;

    newLiteralStringItem = goSupportedSchemasModel.literalStringItem;
    newLiteralNumberItem = goSupportedSchemasModel.literalNumberItem;

    newEnumItem = goSupportedSchemasModel.enumItem;
    newNativeEnumItem = goSupportedSchemasModel.nativeEnumItem;

    newDoubleItem = goSupportedSchemasModel.doubleItem;
    newBigIntItem = goSupportedSchemasModel.bigIntItem;
    newInt64Item = goSupportedSchemasModel.int64Item;
    newInt32Item = goSupportedSchemasModel.int32Item;

    newBooleanItem = goSupportedSchemasModel.booleanItem;

    newObjectItem = goSupportedSchemasModel.objectItem;

    newDateItem = goSupportedSchemasModel.dateItem;

    newArrayItem = goSupportedSchemasModel.arrayItem;

    newRecordItem = goSupportedSchemasModel.recordItem;
    newMapItem = goSupportedSchemasModel.mapItem;
    newSetItem = goSupportedSchemasModel.setItem;
    newTupleItem = goSupportedSchemasModel.tupleItem;

    newUnionItem = goSupportedSchemasModel.unionItem;
    newDiscriminatedUnionItem = goSupportedSchemasModel.discriminatedUnionItem;
    newIntersectionItem = goSupportedSchemasModel.intersectionItem;

    newAnyItem = goSupportedSchemasModel.anyItem;
    newOptionalItem = goSupportedSchemasModel.optionalItem;
    newNullableItem = goSupportedSchemasModel.nullableItem;
}

export const goSupportedSchemasApplicationModel = new GoSupportedSchemasApplication();
