/**
 * @description Python library imports for Pydantic
 * @returns
 */
export function getLibs() {
    return {
        baseModel: "from pydantic import BaseModel, ConfigDict",
        fieldImport: "from pydantic import Field",
        aliasGenerator: "from pydantic.alias_generators import to_camel",
        annotatedType: "from typing import Annotated",
        typeAliasType: "from typing import TypeAlias",
        genericType: "from typing import Generic",
        typeVarType: "from typing import TypeVar",
        enumType: "from enum import Enum",
        anyType: "from typing import Any",
        listType: "from typing import List",
        dictType: "from typing import Dict",
        setType: "from typing import Set",
        tupleType: "from typing import Tuple",
        unionType: "from typing import Union",
        optionalType: "from typing import Optional",
        literalType: "from typing import Literal",
        datetimeType: "from datetime import datetime",
    };
}
