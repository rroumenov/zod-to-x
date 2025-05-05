// This is
// a multiline
// header.

import * as TS_SUPPORTED_SCHEMAS from "./ts_supported_schemas.entity";

export type NewEnumItem = TS_SUPPORTED_SCHEMAS.EnumItem;

export type NewNativeEnumItem = TS_SUPPORTED_SCHEMAS.NativeEnumItem;

export class NewObjectItem extends TS_SUPPORTED_SCHEMAS.ObjectItem {}

export class NewUnionItem extends TS_SUPPORTED_SCHEMAS.UnionItem {}

export type NewDiscriminatedUnionItem = TS_SUPPORTED_SCHEMAS.DiscriminatedUnionItem;

export class NewIntersectionItem extends TS_SUPPORTED_SCHEMAS.IntersectionItem {}

export class TsSupportedSchemasApplication {
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

    constructor(data: TsSupportedSchemasApplication) {
        this.newStringItem = data.newStringItem;
        this.newLiteralStringItem = data.newLiteralStringItem;
        this.newLiteralNumberItem = data.newLiteralNumberItem;
        this.newEnumItem = data.newEnumItem;
        this.newNativeEnumItem = data.newNativeEnumItem;
        this.newDoubleItem = data.newDoubleItem;
        this.newBigIntItem = data.newBigIntItem;
        this.newInt64Item = data.newInt64Item;
        this.newInt32Item = data.newInt32Item;
        this.newBooleanItem = data.newBooleanItem;
        this.newObjectItem = data.newObjectItem;
        this.newDateItem = data.newDateItem;
        this.newArrayItem = data.newArrayItem;
        this.newRecordItem = data.newRecordItem;
        this.newMapItem = data.newMapItem;
        this.newSetItem = data.newSetItem;
        this.newTupleItem = data.newTupleItem;
        this.newUnionItem = data.newUnionItem;
        this.newDiscriminatedUnionItem = data.newDiscriminatedUnionItem;
        this.newIntersectionItem = data.newIntersectionItem;
        this.newAnyItem = data.newAnyItem;
        this.newOptionalItem = data.newOptionalItem;
        this.newNullableItem = data.newNullableItem;
    }
}
