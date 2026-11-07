package models

type EventKind string

const (
    EventKindCreated EventKind = "Created"
    EventKindDeleted EventKind = "Deleted"
    EventKindArchived EventKind = "Archived"
)

type Created struct {
    Kind EventKind `json:"kind"`
    Id string `json:"id"`
}

type Deleted struct {
    Kind EventKind `json:"kind"`
    Id string `json:"id"`
    Reason *string `json:"reason,omitempty"`
}

type MessageType string

const (
    MessageTypeInfo MessageType = "Info"
    MessageTypeAlert MessageType = "Alert"
)

type Message[K any, P any] struct {
    Type K `json:"type"`
    Payload P `json:"payload"`
}

type Notice struct {
    Text string `json:"text"`
}

type Alert struct {
    Text string `json:"text"`
    Level int64 `json:"level"`
}

