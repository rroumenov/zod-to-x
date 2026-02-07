# This is
# a multiline
# header.

from datetime import datetime
from enum import Enum
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel
from typing import Annotated, Any, Dict, List, Literal, Optional, Set, Tuple, Union

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

# Another object
class OtherObjectItem(BaseSchema):
    other_key: str

# A union of two objects
UnionItem = Union[ObjectItem, OtherObjectItem]

class UnionItemWrapper(BaseSchema):
    data: UnionItem

# An object with a discriminator
class ObjectItemWithDiscriminator(BaseSchema):
    key: str
    discriminator: Literal[EnumItem.ENUM1]

# Another object with a discriminator
class OtherObjectItemWithDiscriminator(BaseSchema):
    other_key: str
    discriminator: Literal[EnumItem.ENUM2]

# A discriminated union of two objects
DiscriminatedUnionItem = Annotated[
    Union[ObjectItemWithDiscriminator, OtherObjectItemWithDiscriminator],
    Field(discriminator='discriminator')
]

class DiscriminatedUnionItemWrapper(BaseSchema):
    data: DiscriminatedUnionItem

# An intersection of two objects
class IntersectionItem(ObjectItem, OtherObjectItem): ...

class PySupportedSchemas(BaseSchema):

    # A simple string
    string_item: str

    # A literal string
    literal_string_item: Literal["literal"]

    # A literal number
    literal_number_item: Literal[1]
    enum_item: EnumItem
    native_enum_item: NativeEnumItem

    # A double
    double_item: float

    # A big integer
    big_int_item: int

    # A 64-bit integer
    int64_item: int

    # A 32-bit integer
    int32_item: int

    # A boolean
    boolean_item: bool
    object_item: ObjectItem

    # A date
    date_item: datetime

    # A two-dimensional array of numbers
    array_item: List[List[float]]

    # A record with string keys and number values
    record_item: Dict[str, float]

    # A map with string keys and number values
    map_item: Dict[str, float]

    # A set of strings
    set_item: Set[str]

    # A tuple of a number, a string, and a boolean
    tuple_item: Tuple[float, str, bool]
    union_item: UnionItem
    discriminated_union_item: DiscriminatedUnionItem
    intersection_item: IntersectionItem

    # Any type
    any_item: Any

    # An optional string
    optional_item: Optional[str] = None

    # A nullable string
    nullable_item: Optional[str] = None
