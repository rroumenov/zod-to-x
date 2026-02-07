# This is
# a multiline
# header.

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from typing import Literal, Optional, TypeAlias
import py_supported_schemas_entity as PY_SUPPORTED_SCHEMAS

NewStringItem: TypeAlias = PY_SUPPORTED_SCHEMAS.StringItem

NewEnumItem: TypeAlias = PY_SUPPORTED_SCHEMAS.EnumItem

NewNativeEnumItem: TypeAlias = PY_SUPPORTED_SCHEMAS.NativeEnumItem

NewDoubleItem: TypeAlias = PY_SUPPORTED_SCHEMAS.DoubleItem

NewBigIntItem: TypeAlias = PY_SUPPORTED_SCHEMAS.BigIntItem

NewInt64Item: TypeAlias = PY_SUPPORTED_SCHEMAS.Int64Item

NewInt32Item: TypeAlias = PY_SUPPORTED_SCHEMAS.Int32Item

NewBooleanItem: TypeAlias = PY_SUPPORTED_SCHEMAS.BooleanItem

class NewObjectItem(PY_SUPPORTED_SCHEMAS.ObjectItem): ...

NewDateItem: TypeAlias = PY_SUPPORTED_SCHEMAS.DateItem

NewArrayItem: TypeAlias = PY_SUPPORTED_SCHEMAS.ArrayItem

NewRecordItem: TypeAlias = PY_SUPPORTED_SCHEMAS.RecordItem

NewMapItem: TypeAlias = PY_SUPPORTED_SCHEMAS.MapItem

NewSetItem: TypeAlias = PY_SUPPORTED_SCHEMAS.SetItem

NewTupleItem: TypeAlias = PY_SUPPORTED_SCHEMAS.TupleItem

NewUnionItem: TypeAlias = PY_SUPPORTED_SCHEMAS.UnionItem

NewDiscriminatedUnionItem: TypeAlias = PY_SUPPORTED_SCHEMAS.DiscriminatedUnionItem

class NewIntersectionItem(PY_SUPPORTED_SCHEMAS.IntersectionItem): ...

NewAnyItem: TypeAlias = PY_SUPPORTED_SCHEMAS.AnyItem

class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        serialize_by_alias=True,
        populate_by_name=True,
        use_enum_values=True
    )

class PySupportedSchemasApplication(BaseSchema):
    new_string_item: NewStringItem

    # A literal string
    new_literal_string_item: Literal["literal"]

    # A literal number
    new_literal_number_item: Literal[1]
    new_enum_item: NewEnumItem
    new_native_enum_item: NewNativeEnumItem
    new_double_item: NewDoubleItem
    new_big_int_item: NewBigIntItem
    new_int64_item: NewInt64Item
    new_int32_item: NewInt32Item
    new_boolean_item: NewBooleanItem
    new_object_item: NewObjectItem
    new_date_item: NewDateItem
    new_array_item: NewArrayItem
    new_record_item: NewRecordItem
    new_map_item: NewMapItem
    new_set_item: NewSetItem
    new_tuple_item: NewTupleItem
    new_union_item: NewUnionItem
    new_discriminated_union_item: NewDiscriminatedUnionItem
    new_intersection_item: NewIntersectionItem
    new_any_item: NewAnyItem

    # An optional string
    new_optional_item: Optional[str] = None

    # A nullable string
    new_nullable_item: Optional[str] = None
