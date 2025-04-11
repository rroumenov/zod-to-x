import { z } from "zod";
import { Application, Domain, Zod2XModel } from "../../dist";
import {
    zObjectWithDiscriminator,
    zOtherObject,
    zOtherObjectWithDiscriminator,
} from "../common/zod_schemas";
import { zTsSupportedSchemas } from "./ts_supported_schemas";

const tsSupportedSchemas = zTsSupportedSchemas._def.shape();

@Domain({ namespace: "TS_SUPPORTED_SCHEMAS", file: "ts_supported_schemas.entity" })
class TsSupportedSchemas extends Zod2XModel {
    stringItem = tsSupportedSchemas.stringItem;

    literalStringItem = tsSupportedSchemas.literalStringItem;
    literalNumberItem = tsSupportedSchemas.literalNumberItem;

    enumItem = tsSupportedSchemas.enumItem;
    nativeEnumItem = tsSupportedSchemas.nativeEnumItem;

    doubleItem = tsSupportedSchemas.doubleItem;
    bigIntItem = tsSupportedSchemas.bigIntItem;
    int64Item = tsSupportedSchemas.int64Item;
    int32Item = tsSupportedSchemas.int32Item;

    booleanItem = tsSupportedSchemas.booleanItem;

    objectItem = tsSupportedSchemas.objectItem;
    otherObjectItem = zOtherObject;
    objectItemWithDiscriminator = zObjectWithDiscriminator;
    otherObjectItemWithDiscriminator = zOtherObjectWithDiscriminator;

    dateItem = tsSupportedSchemas.dateItem;

    arrayItem = tsSupportedSchemas.arrayItem;

    recordItem = tsSupportedSchemas.recordItem;
    mapItem = tsSupportedSchemas.mapItem;
    setItem = tsSupportedSchemas.setItem;
    tupleItem = tsSupportedSchemas.tupleItem;

    unionItem = z.union([this.objectItem, this.otherObjectItem]);
    discriminatedUnionItem = z.discriminatedUnion("discriminator", [
        this.objectItemWithDiscriminator,
        this.otherObjectItemWithDiscriminator,
    ]);
    intersectionItem = z.intersection(this.objectItem, this.otherObjectItem);

    anyItem = tsSupportedSchemas.anyItem;
    optionalItem = tsSupportedSchemas.optionalItem;
    nullableItem = tsSupportedSchemas.nullableItem;
}

export const tsSupportedSchemasModel = new TsSupportedSchemas();

@Application({ namespace: "TS_SUPPORTED_SCHEMAS_APP", file: "ts_supported_schemas.app" })
class TsSupportedSchemasApplication extends Zod2XModel {
    newStringItem = tsSupportedSchemasModel.stringItem;

    newLiteralStringItem = tsSupportedSchemasModel.literalStringItem;
    newLiteralNumberItem = tsSupportedSchemasModel.literalNumberItem;

    newEnumItem = tsSupportedSchemasModel.enumItem;
    newNativeEnumItem = tsSupportedSchemasModel.nativeEnumItem;

    newDoubleItem = tsSupportedSchemasModel.doubleItem;
    newBigIntItem = tsSupportedSchemasModel.bigIntItem;
    newInt64Item = tsSupportedSchemasModel.int64Item;
    newInt32Item = tsSupportedSchemasModel.int32Item;

    newBooleanItem = tsSupportedSchemasModel.booleanItem;

    newObjectItem = tsSupportedSchemasModel.objectItem;

    newDateItem = tsSupportedSchemasModel.dateItem;

    newArrayItem = tsSupportedSchemasModel.arrayItem;

    newRecordItem = tsSupportedSchemasModel.recordItem;
    newMapItem = tsSupportedSchemasModel.mapItem;
    newSetItem = tsSupportedSchemasModel.setItem;
    newTupleItem = tsSupportedSchemasModel.tupleItem;

    newUnionItem = tsSupportedSchemasModel.unionItem;
    newDiscriminatedUnionItem = tsSupportedSchemasModel.discriminatedUnionItem;
    newIntersectionItem = tsSupportedSchemasModel.intersectionItem;

    newAnyItem = tsSupportedSchemasModel.anyItem;
    newOptionalItem = tsSupportedSchemasModel.optionalItem;
    newNullableItem = tsSupportedSchemasModel.nullableItem;
}

export const tsSupportedSchemasApplicationModel = new TsSupportedSchemasApplication();
