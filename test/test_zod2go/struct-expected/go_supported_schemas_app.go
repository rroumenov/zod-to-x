package models

import GO_SUPPORTED_SCHEMAS "./go_supported_schemas_entity"

type NewStringItem = GO_SUPPORTED_SCHEMAS.StringItem

type NewEnumItem = GO_SUPPORTED_SCHEMAS.EnumItem

type NewNativeEnumItem = GO_SUPPORTED_SCHEMAS.NativeEnumItem

type NewDoubleItem = GO_SUPPORTED_SCHEMAS.DoubleItem

type NewBigIntItem = GO_SUPPORTED_SCHEMAS.BigIntItem

type NewInt64Item = GO_SUPPORTED_SCHEMAS.Int64Item

type NewInt32Item = GO_SUPPORTED_SCHEMAS.Int32Item

type NewBooleanItem = GO_SUPPORTED_SCHEMAS.BooleanItem

type NewObjectItem struct {
    GO_SUPPORTED_SCHEMAS.ObjectItem
}

type NewDateItem = GO_SUPPORTED_SCHEMAS.DateItem

type NewArrayItem = GO_SUPPORTED_SCHEMAS.ArrayItem

type NewRecordItem = GO_SUPPORTED_SCHEMAS.RecordItem

type NewMapItem = GO_SUPPORTED_SCHEMAS.MapItem

type NewSetItem = GO_SUPPORTED_SCHEMAS.SetItem

type NewTupleItem = GO_SUPPORTED_SCHEMAS.TupleItem

type NewUnionItem = GO_SUPPORTED_SCHEMAS.UnionItem

type NewDiscriminatedUnionItem = GO_SUPPORTED_SCHEMAS.DiscriminatedUnionItem

type NewIntersectionItem struct {
    GO_SUPPORTED_SCHEMAS.IntersectionItem
}

type NewAnyItem = GO_SUPPORTED_SCHEMAS.AnyItem

type GoSupportedSchemasApplication struct {
    NewStringItem NewStringItem `json:"newStringItem"`

    // A literal string
    NewLiteralStringItem string `json:"newLiteralStringItem"`

    // A literal number
    NewLiteralNumberItem int64 `json:"newLiteralNumberItem"`
    NewEnumItem NewEnumItem `json:"newEnumItem"`
    NewNativeEnumItem NewNativeEnumItem `json:"newNativeEnumItem"`
    NewDoubleItem NewDoubleItem `json:"newDoubleItem"`
    NewBigIntItem NewBigIntItem `json:"newBigIntItem"`
    NewInt64Item NewInt64Item `json:"newInt64Item"`
    NewInt32Item NewInt32Item `json:"newInt32Item"`
    NewBooleanItem NewBooleanItem `json:"newBooleanItem"`
    NewObjectItem NewObjectItem `json:"newObjectItem"`
    NewDateItem NewDateItem `json:"newDateItem"`
    NewArrayItem NewArrayItem `json:"newArrayItem"`
    NewRecordItem NewRecordItem `json:"newRecordItem"`
    NewMapItem NewMapItem `json:"newMapItem"`
    NewSetItem NewSetItem `json:"newSetItem"`
    NewTupleItem NewTupleItem `json:"newTupleItem"`
    NewUnionItem NewUnionItem `json:"newUnionItem"`
    NewDiscriminatedUnionItem NewDiscriminatedUnionItem `json:"newDiscriminatedUnionItem"`
    NewIntersectionItem NewIntersectionItem `json:"newIntersectionItem"`
    NewAnyItem NewAnyItem `json:"newAnyItem"`

    // An optional string
    NewOptionalItem *string `json:"newOptionalItem,omitempty"`

    // A nullable string
    NewNullableItem *string `json:"newNullableItem,omitempty"`
}
