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

class Item(BaseSchema):
    id: str
    price: float

TCursor = TypeVar('TCursor')
TContent = TypeVar('TContent')

class Page(BaseSchema, Generic[TCursor, TContent]):
    cursor: TCursor
    content: TContent
    total: int

class PageDefault(Page[str, Item]): ...

class PageOfNumbers(Page[str, List[float]]): ...

class PageCustom(Page[int, List[Item]]): ...

class Catalog(BaseSchema):
    first_page: Page[str, Item]
