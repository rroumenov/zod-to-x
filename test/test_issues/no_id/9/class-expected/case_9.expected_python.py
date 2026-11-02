from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
import case_9_domain as CASE_9_DOMAIN

class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        serialize_by_alias=True,
        populate_by_name=True,
        use_enum_values=True
    )

class Wrapper(BaseSchema):
    domain_user: CASE_9_DOMAIN.User

class User(BaseSchema):
    name: str
    is_admin: bool
