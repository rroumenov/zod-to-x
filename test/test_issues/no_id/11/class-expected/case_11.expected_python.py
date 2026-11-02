from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from typing import List

class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        serialize_by_alias=True,
        populate_by_name=True,
        use_enum_values=True
    )

class UserEntity(BaseSchema):
    id: str
    name: str

class Group(BaseSchema):
    owner: UserEntity
    members: List[UserEntity]
