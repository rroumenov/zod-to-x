from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from typing import List, Optional, TypeAlias
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

# Description of the base type.
Restated: TypeAlias = CASE_21_DOMAIN.Documented

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

class Order(BaseSchema):
    # Field redefining the base description.
    redefined: CASE_21_DOMAIN.Documented
    # Description of the base type.
    restated: CASE_21_DOMAIN.Documented
    # Field documenting an undocumented type.
    documented: CASE_21_DOMAIN.Uuid
    # Described before optional.
    described_before: Optional[CASE_21_DOMAIN.Uuid] = None
    # Described after optional.
    described_after: Optional[CASE_21_DOMAIN.Uuid] = None
    # List of identifiers.
    list: List[CASE_21_DOMAIN.Uuid]
    # Field of an object type.
    address: CASE_21_DOMAIN.Address
    # Field of an enum type.
    currency: CASE_21_DOMAIN.Currency
    # Field of a basic type.
    local: str
    plain: CASE_21_DOMAIN.Documented
    plain_optional: Optional[CASE_21_DOMAIN.Documented] = None
