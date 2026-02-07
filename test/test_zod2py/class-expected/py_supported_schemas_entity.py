# This is
# a multiline
# header.

from datetime import datetime
from enum import Enum
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel
from typing import Annotated, Any, Dict, List, Literal, Optional, Set, Tuple, TypeAlias, Union

# A simple string
StringItem: TypeAlias = str

# An enum
class EnumItem(str, Enum):
    ENUM1 = "Enum1"
    ENUM2 = "Enum2"
    ENUM3 = "Enum3"

# A native enum
class NativeEnumItem(Enum):
    NATIVE_ENUM1 = 1
    NATIVE_ENUM2 = 2
    NATIVE_ENUM3 = "NativeEnum3"

# A double
DoubleItem: TypeAlias = float

# A big integer
BigIntItem: TypeAlias = int

# A 64-bit integer
Int64Item: TypeAlias = int

# A 32-bit integer
Int32Item: TypeAlias = int

# A boolean
BooleanItem: TypeAlias = bool

class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        serialize_by_alias=True,
        populate_by_name=True,
        use_enum_values=True
    )

# An object
class ObjectItem(BaseSchema):
    key: str

# Other Object Item
class OtherObjectItem(BaseSchema):
    other_key: str

# Object Item With Discriminator
class ObjectItemWithDiscriminator(BaseSchema):
    key: str
    discriminator: Literal[EnumItem.ENUM1]

# Other Object Item With Discriminator
class OtherObjectItemWithDiscriminator(BaseSchema):
    other_key: str
    discriminator: Literal[EnumItem.ENUM2]

# A date
DateItem: TypeAlias = datetime

# A two-dimensional array of numbers
ArrayItem: TypeAlias = List[List[float]]

# A record with string keys and number values
RecordItem: TypeAlias = Dict[str, float]

# A map with string keys and number values
MapItem: TypeAlias = Dict[str, float]

# A set of strings
SetItem: TypeAlias = Set[str]

# A tuple of a number, a string, and a boolean
TupleItem: TypeAlias = Tuple[float, str, bool]

# Union Item
UnionItem = Union[ObjectItem, OtherObjectItem]

class UnionItemWrapper(BaseSchema):
    data: UnionItem

# Discriminated Union Item
DiscriminatedUnionItem = Annotated[
    Union[ObjectItemWithDiscriminator, OtherObjectItemWithDiscriminator],
    Field(discriminator='discriminator')
]

class DiscriminatedUnionItemWrapper(BaseSchema):
    data: DiscriminatedUnionItem

# Intersection Item
class IntersectionItem(ObjectItem, OtherObjectItem): ...

# Any type
AnyItem: TypeAlias = Any

class PySupportedSchemas(BaseSchema):
    string_item: StringItem

    # A literal string
    literal_string_item: Literal["literal"]

    # A literal number
    literal_number_item: Literal[1]
    enum_item: EnumItem
    native_enum_item: NativeEnumItem
    double_item: DoubleItem
    big_int_item: BigIntItem
    int64_item: Int64Item
    int32_item: Int32Item
    boolean_item: BooleanItem
    object_item: ObjectItem
    other_object_item: OtherObjectItem
    object_item_with_discriminator: ObjectItemWithDiscriminator
    other_object_item_with_discriminator: OtherObjectItemWithDiscriminator
    date_item: DateItem
    array_item: ArrayItem
    record_item: RecordItem
    map_item: MapItem
    set_item: SetItem
    tuple_item: TupleItem
    union_item: UnionItem
    discriminated_union_item: DiscriminatedUnionItem
    intersection_item: IntersectionItem
    any_item: AnyItem

    # An optional string
    optional_item: Optional[str] = None

    # A nullable string
    nullable_item: Optional[str] = None