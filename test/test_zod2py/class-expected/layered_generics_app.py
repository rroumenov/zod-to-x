# This is
# a multiline
# header.

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from typing import Any, Dict, Generic, List, Optional, TypeAlias, TypeVar, Union

class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        serialize_by_alias=True,
        populate_by_name=True,
        use_enum_values=True
    )

T = TypeVar('T')

# GenericUserEntity
class GenericUserEntity(BaseSchema, Generic[T]):
    id: str
    name: str
    email: str
    age: Optional[int] = None
    metadata: T

# NormalUserMetadata
class NormalUserMetadata(BaseSchema):
    favorite_color: str
    hobbies: List[str]

class NormalUserEntity(GenericUserEntity[NormalUserMetadata]): ...

# AdminUserMetadata
class AdminUserMetadata(BaseSchema):
    admin_level: int
    permissions: List[str]

class AdminUserEntity(GenericUserEntity[AdminUserMetadata]): ...

RecordStringAny: TypeAlias = Dict[str, Any]

# UserEntities
UserEntities = Union[NormalUserEntity, AdminUserEntity, GenericUserEntity[RecordStringAny]]

class UserEntitiesWrapper(BaseSchema):
    data: UserEntities
