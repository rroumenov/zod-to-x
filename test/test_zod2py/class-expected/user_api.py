# This is
# a multiline
# header.

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from typing import List
import user.dtos as USER_DTOS

class ReqUpdateUser(USER_DTOS.UpdateUserUseCaseDto): ...

class ResUpdateUser(USER_DTOS.UpdateUserUseCaseResultDto): ...

class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        serialize_by_alias=True,
        populate_by_name=True,
        use_enum_values=True
    )

class ResUpdateUserMulti(BaseSchema):
    amount: int
    data: List[USER_DTOS.UpdateUserUseCaseResultDto]

class UserApi(BaseSchema):
    req_update_user: ReqUpdateUser
    res_update_user: ResUpdateUser
    res_update_user_multi: ResUpdateUserMulti
