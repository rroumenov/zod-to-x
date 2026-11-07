from enum import Enum
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

# Account status
class Status(str, Enum):
    ACTIVE = "Active"
    INACTIVE = "Inactive"

class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        serialize_by_alias=True,
        populate_by_name=True,
        use_enum_values=True
    )

# Postal address
class Address(BaseSchema):
    street: str
    city: str

class Account(BaseSchema):
    id: str
    status: Status
    address: Address
