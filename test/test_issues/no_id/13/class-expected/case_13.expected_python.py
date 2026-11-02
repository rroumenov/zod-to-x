from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from typing import Generic, List, TypeVar

class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        serialize_by_alias=True,
        populate_by_name=True,
        use_enum_values=True
    )

TCursor = TypeVar('TCursor')
TContent = TypeVar('TContent')

class Page(BaseSchema, Generic[TCursor, TContent]):
    cursor: TCursor
    content: TContent
    total: int

class Item(BaseSchema):
    id: str
    price: float

class PageOfItems(Page[int, Item]): ...

class PageOfIds(Page[str, List[str]]): ...
