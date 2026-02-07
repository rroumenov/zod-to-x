# This is
# a multiline
# header.

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel
from typing import Annotated, Any, Dict, Generic, Literal, Optional, TypeVar, Union
import layered_generics.app as GENERICS_APP

class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        serialize_by_alias=True,
        populate_by_name=True,
        use_enum_values=True
    )

T = TypeVar('T')

class HttpSuccessfulResponse(BaseSchema, Generic[T]):
    success: Literal[True]
    data: T

class HttpUnsuccessfulResponse(BaseSchema):
    success: Literal[False]
    message: str
    details: Optional[Dict[str, Any]] = None

class HttpErrorResponse(BaseSchema):
    message: str

class SomeDtoResult(BaseSchema):
    id: str
    name: str
    age: int

class InternalObjectWithGeneric(HttpSuccessfulResponse[SomeDtoResult]): ...

class ObjectWithGeneric(BaseSchema):
    internal: InternalObjectWithGeneric
    item: HttpSuccessfulResponse[SomeDtoResult]
    user_item: GENERICS_APP.GenericUserEntity[SomeDtoResult]
    other_user_item: GENERICS_APP.AdminUserEntity

class OtherDtoResult(BaseSchema):
    code: str
    description: str

class DataRetrieve(HttpSuccessfulResponse[SomeDtoResult]): ...

DiscriminantDataRetrieve = Annotated[
    Union[HttpSuccessfulResponse[SomeDtoResult], HttpUnsuccessfulResponse],
    Field(discriminator='success')
]

class DiscriminantDataRetrieveWrapper(BaseSchema):
    data: DiscriminantDataRetrieve

class IntersectedDataRetrieve(HttpSuccessfulResponse[SomeDtoResult], GENERICS_APP.GenericUserEntity[OtherDtoResult]): ...

class UserRetrieve(HttpSuccessfulResponse[GENERICS_APP.NormalUserEntity]): ...