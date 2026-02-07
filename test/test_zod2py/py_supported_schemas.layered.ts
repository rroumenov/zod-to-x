import { z } from "zod";
import { Application, Domain, Zod2XModel } from "../../dist";
import { getPySupportedSchemas } from "./py_supported_schemas";

const pySupportedSchemas = getPySupportedSchemas();

@Domain({
    namespace: "PY_SUPPORTED_SCHEMAS",
    file: "py_supported_schemas_entity",
    skipLayerInterface: false,
})
class PySupportedSchemas extends Zod2XModel {
    stringItem = pySupportedSchemas.stringItem;

    literalStringItem = pySupportedSchemas.literalStringItem;
    literalNumberItem = pySupportedSchemas.literalNumberItem;

    enumItem = pySupportedSchemas.enumItem;
    nativeEnumItem = pySupportedSchemas.nativeEnumItem;

    doubleItem = pySupportedSchemas.doubleItem;
    bigIntItem = pySupportedSchemas.bigIntItem;
    int64Item = pySupportedSchemas.int64Item;
    int32Item = pySupportedSchemas.int32Item;

    booleanItem = pySupportedSchemas.booleanItem;

    objectItem = pySupportedSchemas.objectItem;
    otherObjectItem = z
        .object({
            otherKey: z.string(),
        })
        .describe("Other Object Item")
        .zod2x("OtherObjectItem");
    objectItemWithDiscriminator = z
        .object({
            key: z.string(),
            discriminator: z.literal(this.enumItem.enum.Enum1).zod2x(this.enumItem),
        })
        .describe("Object Item With Discriminator")
        .zod2x("ObjectItemWithDiscriminator");
    otherObjectItemWithDiscriminator = z
        .object({
            otherKey: z.string(),
            discriminator: z.literal(this.enumItem.enum.Enum2).zod2x(this.enumItem),
        })
        .describe("Other Object Item With Discriminator")
        .zod2x("OtherObjectItemWithDiscriminator");

    dateItem = pySupportedSchemas.dateItem;

    arrayItem = pySupportedSchemas.arrayItem;

    recordItem = pySupportedSchemas.recordItem;
    mapItem = pySupportedSchemas.mapItem;
    setItem = pySupportedSchemas.setItem;
    tupleItem = pySupportedSchemas.tupleItem;

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

    anyItem = pySupportedSchemas.anyItem;
    optionalItem = pySupportedSchemas.optionalItem;
    nullableItem = pySupportedSchemas.nullableItem;
}

export const pySupportedSchemasModel = new PySupportedSchemas();

@Application({
    namespace: "PY_SUPPORTED_SCHEMAS_APP",
    file: "py_supported_schemas_app",
    skipLayerInterface: false,
})
class PySupportedSchemasApplication extends Zod2XModel {
    newStringItem = pySupportedSchemasModel.stringItem;

    newLiteralStringItem = pySupportedSchemasModel.literalStringItem;
    newLiteralNumberItem = pySupportedSchemasModel.literalNumberItem;

    newEnumItem = pySupportedSchemasModel.enumItem;
    newNativeEnumItem = pySupportedSchemasModel.nativeEnumItem;

    newDoubleItem = pySupportedSchemasModel.doubleItem;
    newBigIntItem = pySupportedSchemasModel.bigIntItem;
    newInt64Item = pySupportedSchemasModel.int64Item;
    newInt32Item = pySupportedSchemasModel.int32Item;

    newBooleanItem = pySupportedSchemasModel.booleanItem;

    newObjectItem = pySupportedSchemasModel.objectItem;

    newDateItem = pySupportedSchemasModel.dateItem;

    newArrayItem = pySupportedSchemasModel.arrayItem;

    newRecordItem = pySupportedSchemasModel.recordItem;
    newMapItem = pySupportedSchemasModel.mapItem;
    newSetItem = pySupportedSchemasModel.setItem;
    newTupleItem = pySupportedSchemasModel.tupleItem;

    newUnionItem = pySupportedSchemasModel.unionItem;
    newDiscriminatedUnionItem = pySupportedSchemasModel.discriminatedUnionItem;
    newIntersectionItem = pySupportedSchemasModel.intersectionItem;

    newAnyItem = pySupportedSchemasModel.anyItem;
    newOptionalItem = pySupportedSchemasModel.optionalItem;
    newNullableItem = pySupportedSchemasModel.nullableItem;
}

export const pySupportedSchemasApplicationModel = new PySupportedSchemasApplication();
