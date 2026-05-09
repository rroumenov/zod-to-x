from typing import TypeVar
import case_6_domain as CASE_6_DOMAIN

T = TypeVar('T')

class GenericBoxAlias(CASE_6_DOMAIN.GenericBox[T]): ...

class ConcreteBoxAlias(CASE_6_DOMAIN.ConcreteBox): ...
