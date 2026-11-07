from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from typing import List, Optional

class BaseSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        serialize_by_alias=True,
        populate_by_name=True,
        use_enum_values=True
    )

class File(BaseSchema):
    name: str
    size: int

class Folder(BaseSchema):
    name: str
    main_file: Optional[File] = None
    readme: Optional[File] = None
    files: List[File]
    owner: Optional[str] = None
