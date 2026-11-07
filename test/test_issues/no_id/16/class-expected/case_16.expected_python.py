from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from typing import List, Optional, TypeAlias
import case_16_domain as CASE_16_DOMAIN

class ShippingAddress(CASE_16_DOMAIN.Address): ...

class OrderItem(CASE_16_DOMAIN.Item): ...

PaymentCurrency: TypeAlias = CASE_16_DOMAIN.Currency

RefundCurrency: TypeAlias = CASE_16_DOMAIN.Currency

class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        serialize_by_alias=True,
        populate_by_name=True,
        use_enum_values=True
    )

class Contact(BaseSchema):
    email: str

class Customer(Contact): ...

class Order(BaseSchema):
    id: str
    destination: ShippingAddress
    billing: Optional[ShippingAddress] = None
    items: List[OrderItem]
    currency: CASE_16_DOMAIN.Currency
    contact: Contact

class OrderItemPage(CASE_16_DOMAIN.Page[OrderItem]): ...
