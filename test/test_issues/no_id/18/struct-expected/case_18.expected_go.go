package models

import (
	"encoding/json"
	"fmt"
)

type MessageType string

const (
    MessageTypeUserCreated MessageType = "UserCreated"
    MessageTypeUserDeleted MessageType = "UserDeleted"
)

type UserCreated struct {
    Id string `json:"id"`
    Name string `json:"name"`
}

type UserDeleted struct {
    Id string `json:"id"`
    Reason *string `json:"reason,omitempty"`
}

type Message[K any, P any] struct {
    Type K `json:"type"`
    Payload P `json:"payload"`
    SentAt float64 `json:"sentAt"`
}

// AnyMessage is a discriminated union on "type".
// Possible types: Message[MessageType, UserCreated], Message[MessageType, UserDeleted]
type AnyMessage interface {
    isAnyMessage()
}

func (t Message[T1, T2]) isAnyMessage() {}

// UnmarshalAnyMessage deserializes JSON into the correct AnyMessage concrete type
// by probing the "type" discriminant field.
func UnmarshalAnyMessage(data []byte) (AnyMessage, error) {
    var probe struct {
        Type json.RawMessage `json:"type"`
    }
    if err := json.Unmarshal(data, &probe); err != nil {
        return nil, err
    }
    switch string(probe.Type) {
    case `"UserCreated"`:
        var v Message[MessageType, UserCreated]
        if err := json.Unmarshal(data, &v); err != nil {
            return nil, err
        }
        return v, nil
    case `"UserDeleted"`:
        var v Message[MessageType, UserDeleted]
        if err := json.Unmarshal(data, &v); err != nil {
            return nil, err
        }
        return v, nil
    }
    return nil, fmt.Errorf("failed to deserialize AnyMessage: unknown discriminator %s", string(probe.Type))
}

