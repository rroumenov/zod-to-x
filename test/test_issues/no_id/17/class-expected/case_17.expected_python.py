from enum import Enum
from typing import Literal
import case_17_domain as CASE_17_DOMAIN

class Status(str, Enum):
    OPENED = "Opened"
    CLOSED = "Closed"

class CreatedEvent(CASE_17_DOMAIN.Event[Literal[CASE_17_DOMAIN.EventKind.CREATED]]): ...

class OpenedEvent(CASE_17_DOMAIN.Event[Literal[Status.OPENED]]): ...

