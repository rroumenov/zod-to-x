package models

import CASE_17_DOMAIN "./case_17_domain"

type Status string

const (
    StatusOpened Status = "Opened"
    StatusClosed Status = "Closed"
)

type CreatedEvent struct {
    CASE_17_DOMAIN.Event[CASE_17_DOMAIN.EventKind]
}

type OpenedEvent struct {
    CASE_17_DOMAIN.Event[Status]
}

