from enum import Enum
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel
from typing import Annotated, Generic, Literal, Optional, TypeVar, Union

class MessageType(str, Enum):
    USER_CREATED = "UserCreated"
    USER_DELETED = "UserDeleted"

class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        serialize_by_alias=True,
        populate_by_name=True,
        use_enum_values=True
    )

class UserCreated(BaseSchema):
    id: str
    name: str

class UserDeleted(BaseSchema):
    id: str
    reason: Optional[str] = None

K = TypeVar('K')
P = TypeVar('P')

class Message(BaseSchema, Generic[K, P]):
    type: K
    payload: P
    sent_at: float

AnyMessage = Annotated[
    Union[Message[Literal[MessageType.USER_CREATED], UserCreated], Message[Literal[MessageType.USER_DELETED], UserDeleted]],
    Field(discriminator='type')
]

class AnyMessageWrapper(BaseSchema):
    data: AnyMessage

