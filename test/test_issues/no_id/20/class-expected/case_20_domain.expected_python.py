from enum import Enum
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel
from typing import Annotated, Generic, List, Literal, TypeVar, Union

class SortField(str, Enum):
    NAME = "Name"
    DATE = "Date"

class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        serialize_by_alias=True,
        populate_by_name=True,
        use_enum_values=True
    )

class Item(BaseSchema):
    id: str

T = TypeVar('T')

class Box(BaseSchema, Generic[T]):
    value: T

A = TypeVar('A')
B = TypeVar('B')

class Pair(BaseSchema, Generic[A, B]):
    first: A
    second: B

class ItemBox(Box[Item]): ...

class StrBox(Box[str]): ...

class SortBox(Box[SortField]): ...

class ItemPair(Pair[Item, SortField]): ...

class MessageType(str, Enum):
    PING = "Ping"
    SORT = "Sort"
    ITEM = "Item"

K = TypeVar('K')
P = TypeVar('P')

class Message(BaseSchema, Generic[K, P]):
    type: K
    payload: P

AnyMessage = Annotated[
    Union[Message[Literal[MessageType.PING], str], Message[Literal[MessageType.SORT], SortField], Message[Literal[MessageType.ITEM], Item]],
    Field(discriminator='type')
]

class AnyMessageWrapper(BaseSchema):
    data: AnyMessage

class Holder(BaseSchema):
    message: AnyMessage
    messages: List[AnyMessage]

