// This is
// a multiline
// header.

import * as TS_SUPPORTED_SCHEMAS from "./ts_supported_schemas.entity";

export type NewEnumItem = TS_SUPPORTED_SCHEMAS.EnumItem;

export type NewNativeEnumItem = TS_SUPPORTED_SCHEMAS.NativeEnumItem;

export interface NewObjectItem extends TS_SUPPORTED_SCHEMAS.ObjectItem {}

export type NewUnionItem = TS_SUPPORTED_SCHEMAS.UnionItem;

export type NewDiscriminatedUnionItem = TS_SUPPORTED_SCHEMAS.DiscriminatedUnionItem;

export interface NewIntersectionItem extends TS_SUPPORTED_SCHEMAS.IntersectionItem {}

export interface TsSupportedSchemasApplication {
    newStringItem: string;
    newLiteralStringItem: "literal";
    newLiteralNumberItem: 1;
    newEnumItem: NewEnumItem;
    newNativeEnumItem: NewNativeEnumItem;
    newDoubleItem: number;
    newBigIntItem: number;
    newInt64Item: number;
    newInt32Item: number;
    newBooleanItem: boolean;
    newObjectItem: NewObjectItem;
    newDateItem: Date;
    newArrayItem: Array<number[]>;
    newRecordItem: Record<string, number>;
    newMapItem: Map<string, number>;
    newSetItem: Set<string>;
    newTupleItem: [number, string, boolean];
    newUnionItem: NewUnionItem;
    newDiscriminatedUnionItem: NewDiscriminatedUnionItem;
    newIntersectionItem: NewIntersectionItem;
    newAnyItem: any;
    newOptionalItem?: string;
    newNullableItem: string | null;
}
