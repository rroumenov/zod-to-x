from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from typing import TypeAlias
import case_21_domain as CASE_21_DOMAIN

# Identifier of the UTM campaign.
UtmId: TypeAlias = CASE_21_DOMAIN.Uuid

# Where the order is sent.
class ShippingAddress(CASE_21_DOMAIN.Address): ...

# Currency of the payment.
PaymentCurrency: TypeAlias = CASE_21_DOMAIN.Currency

# Tags of the order.
OrderTags: TypeAlias = CASE_21_DOMAIN.Tags

# Description of the alias.
Renamed: TypeAlias = CASE_21_DOMAIN.Documented

Inherited: TypeAlias = CASE_21_DOMAIN.Documented

Undocumented: TypeAlias = CASE_21_DOMAIN.Uuid

class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        serialize_by_alias=True,
        populate_by_name=True,
        use_enum_values=True
    )

class Contact(BaseSchema):
    email: str

# Contact that places the order.
class Customer(Contact): ...
