// This is
// a multiline
// header.

import * as TS_SUPPORTED_SCHEMAS from "./ts_supported_schemas.entity";

export type NewStringItem = TS_SUPPORTED_SCHEMAS.StringItem;

export type NewEnumItem = TS_SUPPORTED_SCHEMAS.EnumItem;

export type NewNativeEnumItem = TS_SUPPORTED_SCHEMAS.NativeEnumItem;

export type NewDoubleItem = TS_SUPPORTED_SCHEMAS.DoubleItem;

export type NewBigIntItem = TS_SUPPORTED_SCHEMAS.BigIntItem;

export type NewInt64Item = TS_SUPPORTED_SCHEMAS.Int64Item;

export type NewInt32Item = TS_SUPPORTED_SCHEMAS.Int32Item;

export type NewBooleanItem = TS_SUPPORTED_SCHEMAS.BooleanItem;

export interface NewObjectItem extends TS_SUPPORTED_SCHEMAS.ObjectItem {}

export type NewDateItem = TS_SUPPORTED_SCHEMAS.DateItem;

export type NewArrayItem = TS_SUPPORTED_SCHEMAS.ArrayItem;

export type NewRecordItem = TS_SUPPORTED_SCHEMAS.RecordItem;

export type NewMapItem = TS_SUPPORTED_SCHEMAS.MapItem;

export type NewSetItem = TS_SUPPORTED_SCHEMAS.SetItem;

export type NewTupleItem = TS_SUPPORTED_SCHEMAS.TupleItem;

export type NewUnionItem = TS_SUPPORTED_SCHEMAS.UnionItem;

export type NewDiscriminatedUnionItem = TS_SUPPORTED_SCHEMAS.DiscriminatedUnionItem;

export interface NewIntersectionItem extends TS_SUPPORTED_SCHEMAS.IntersectionItem {}

export type NewAnyItem = TS_SUPPORTED_SCHEMAS.AnyItem;

export interface TsSupportedSchemasApplication {
    newStringItem: NewStringItem;
    newLiteralStringItem: "literal";
    newLiteralNumberItem: 1;
    newEnumItem: NewEnumItem;
    newNativeEnumItem: NewNativeEnumItem;
    newDoubleItem: NewDoubleItem;
    newBigIntItem: NewBigIntItem;
    newInt64Item: NewInt64Item;
    newInt32Item: NewInt32Item;
    newBooleanItem: NewBooleanItem;
    newObjectItem: NewObjectItem;
    newDateItem: NewDateItem;
    newArrayItem: NewArrayItem;
    newRecordItem: NewRecordItem;
    newMapItem: NewMapItem;
    newSetItem: NewSetItem;
    newTupleItem: NewTupleItem;
    newUnionItem: NewUnionItem;
    newDiscriminatedUnionItem: NewDiscriminatedUnionItem;
    newIntersectionItem: NewIntersectionItem;
    newAnyItem: NewAnyItem;
    newOptionalItem?: string;
    newNullableItem: string | null;
}
