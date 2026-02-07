# This is
# a multiline
# header.

from datetime import datetime
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from typing import Optional
import user.entity as USER

class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        serialize_by_alias=True,
        populate_by_name=True,
        use_enum_values=True
    )

class CreateUserUseCaseDto(BaseSchema):
    name: str
    email: str
    age: Optional[int] = None
    role: USER.UserRole

class CreateUserUseCaseResultDto(BaseSchema):
    id: str
    name: str
    email: str
    age: Optional[int] = None
    created_at: datetime
    updated_at: datetime

class UpdateUserUseCaseDto(CreateUserUseCaseDto): ...

class UpdateUserUseCaseResultDto(USER.UserEntity): ...

class UserDtos(BaseSchema):
    create_user_use_case_dto: CreateUserUseCaseDto
    create_user_use_case_result_dto: CreateUserUseCaseResultDto
    update_user_use_case_dto: UpdateUserUseCaseDto
    update_user_use_case_result_dto: UpdateUserUseCaseResultDto
