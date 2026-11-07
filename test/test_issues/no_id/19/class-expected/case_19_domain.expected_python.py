from enum import Enum
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from typing import Generic, Literal, Optional, TypeVar

class EventKind(str, Enum):
    CREATED = "Created"
    DELETED = "Deleted"
    ARCHIVED = "Archived"

class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        serialize_by_alias=True,
        populate_by_name=True,
        use_enum_values=True
    )

class Created(BaseSchema):
    kind: Literal[EventKind.CREATED]
    id: str

class Deleted(BaseSchema):
    kind: Literal[EventKind.DELETED]
    id: str
    reason: Optional[str] = None

class MessageType(str, Enum):
    INFO = "Info"
    ALERT = "Alert"

K = TypeVar('K')
P = TypeVar('P')

class Message(BaseSchema, Generic[K, P]):
    type: K
    payload: P

class Notice(BaseSchema):
    text: str

class Alert(BaseSchema):
    text: str
    level: int

