from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel
from typing import Annotated, List, Literal, Optional, Union
import case_19_domain as CASE_19_DOMAIN

class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        serialize_by_alias=True,
        populate_by_name=True,
        use_enum_values=True
    )

AnyEvent = Annotated[
    Union[CASE_19_DOMAIN.Created, CASE_19_DOMAIN.Deleted],
    Field(discriminator='kind')
]

class AnyEventWrapper(BaseSchema):
    data: AnyEvent

class Archived(BaseSchema):
    kind: Literal[CASE_19_DOMAIN.EventKind.ARCHIVED]
    id: str

MixedEvent = Annotated[
    Union[CASE_19_DOMAIN.Created, Archived],
    Field(discriminator='kind')
]

class MixedEventWrapper(BaseSchema):
    data: MixedEvent

AnyMessage = Annotated[
    Union[CASE_19_DOMAIN.Message[Literal[CASE_19_DOMAIN.MessageType.INFO], CASE_19_DOMAIN.Notice], CASE_19_DOMAIN.Message[Literal[CASE_19_DOMAIN.MessageType.ALERT], CASE_19_DOMAIN.Alert]],
    Field(discriminator='type')
]

class AnyMessageWrapper(BaseSchema):
    data: AnyMessage

class EventLog(BaseSchema):
    event: AnyEvent
    mixed: MixedEvent
    message: AnyMessage
    history: List[AnyEvent]
    last: Optional[AnyEvent] = None

