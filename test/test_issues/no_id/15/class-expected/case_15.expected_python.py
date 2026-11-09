from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
import case_15_domain as CASE_15_DOMAIN

class Price(CASE_15_DOMAIN.Money): ...

class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        serialize_by_alias=True,
        populate_by_name=True,
        use_enum_values=True
    )

class Invoice(BaseSchema):
    id: str
    total: CASE_15_DOMAIN.Money
