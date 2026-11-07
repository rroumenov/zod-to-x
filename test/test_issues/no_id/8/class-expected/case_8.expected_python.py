from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from typing import Any, List

class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        serialize_by_alias=True,
        populate_by_name=True,
        use_enum_values=True
    )

class Settings(BaseSchema):
    name: str
    retries: int
    enabled: bool
    tags: List[str]
    nickname: str
    port: int
    title: str
    extra: Any
