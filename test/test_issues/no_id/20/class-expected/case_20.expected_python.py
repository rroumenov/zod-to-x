from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from typing import List, Literal
import case_20_domain as CASE_20_DOMAIN

class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        serialize_by_alias=True,
        populate_by_name=True,
        use_enum_values=True
    )

class Usage(BaseSchema):
    item_box: CASE_20_DOMAIN.ItemBox
    str_box: CASE_20_DOMAIN.StrBox
    sort_box: CASE_20_DOMAIN.SortBox
    item_pair: CASE_20_DOMAIN.ItemPair
    pairs: List[CASE_20_DOMAIN.ItemPair]
    message: CASE_20_DOMAIN.AnyMessage

