from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
import case_12_domain as CASE_12_DOMAIN

class ShippingAddress(CASE_12_DOMAIN.Address): ...

class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        serialize_by_alias=True,
        populate_by_name=True,
        use_enum_values=True
    )

class ShippingRequest(BaseSchema):
    order_id: str
    destination: CASE_12_DOMAIN.Address
