# This is
# a multiline
# header.

from enum import Enum
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from typing import Optional

class UserRole(str, Enum):
    ADMIN = "Admin"
    USER = "User"

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
    email: str
    age: Optional[int] = None
    role: UserRole

class UserModels(BaseSchema):
    user_role: UserRole
    user_entity: UserEntity
