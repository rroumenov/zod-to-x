package models

import (
	"encoding/json"
	"fmt"
)

type SortField string

const (
    SortFieldName SortField = "Name"
    SortFieldDate SortField = "Date"
)

type Item struct {
    Id string `json:"id"`
}

type Box[T any] struct {
    Value T `json:"value"`
}

type Pair[A any, B any] struct {
    First A `json:"first"`
    Second B `json:"second"`
}

type ItemBox struct {
    Box[Item]
}

type StrBox struct {
    Box[string]
}

type SortBox struct {
    Box[SortField]
}

type ItemPair struct {
    Pair[Item, SortField]
}

type MessageType string

const (
    MessageTypePing MessageType = "Ping"
    MessageTypeSort MessageType = "Sort"
    MessageTypeItem MessageType = "Item"
)

type Message[K any, P any] struct {
    Type K `json:"type"`
    Payload P `json:"payload"`
}

// AnyMessage is a discriminated union on "type".
// Possible types: Message[MessageType, string], Message[MessageType, SortField], Message[MessageType, Item]
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
    case `"Ping"`:
        var v Message[MessageType, string]
        if err := json.Unmarshal(data, &v); err != nil {
            return nil, err
        }
        return v, nil
    case `"Sort"`:
        var v Message[MessageType, SortField]
        if err := json.Unmarshal(data, &v); err != nil {
            return nil, err
        }
        return v, nil
    case `"Item"`:
        var v Message[MessageType, Item]
        if err := json.Unmarshal(data, &v); err != nil {
            return nil, err
        }
        return v, nil
    }
    return nil, fmt.Errorf("failed to deserialize AnyMessage: unknown discriminator %s", string(probe.Type))
}

type Holder struct {
    Message AnyMessage `json:"message"`
    Messages []AnyMessage `json:"messages"`
}

// UnmarshalJSON deserializes the fields of Holder whose type is a discriminated union.
func (s *Holder) UnmarshalJSON(data []byte) error {
    type alias Holder
    aux := struct {
        *alias
        Message json.RawMessage `json:"message"`
        Messages []json.RawMessage `json:"messages"`
    }{alias: (*alias)(s)}
    if err := json.Unmarshal(data, &aux); err != nil {
        return err
    }
    if len(aux.Message) > 0 && string(aux.Message) != "null" {
        v, err := UnmarshalAnyMessage(aux.Message)
        if err != nil {
            return err
        }
        s.Message = v
    }
    if aux.Messages != nil {
        items := make([]AnyMessage, len(aux.Messages))
        for i, raw := range aux.Messages {
            v, err := UnmarshalAnyMessage(raw)
            if err != nil {
                return err
            }
            items[i] = v
        }
        s.Messages = items
    }
    return nil
}

