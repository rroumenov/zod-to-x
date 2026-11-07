package models

import (
	"encoding/json"
	"fmt"
	CASE_19_DOMAIN "./case_19_domain"
)

// AnyEvent is a discriminated union on "kind".
// Possible types: AnyEventCreated, AnyEventDeleted
type AnyEvent interface {
    isAnyEvent()
}

// AnyEventCreated is the AnyEvent variant of CASE_19_DOMAIN.Created.
type AnyEventCreated struct {
    CASE_19_DOMAIN.Created
}

// AnyEventDeleted is the AnyEvent variant of CASE_19_DOMAIN.Deleted.
type AnyEventDeleted struct {
    CASE_19_DOMAIN.Deleted
}

func (t AnyEventCreated) isAnyEvent() {}

func (t AnyEventDeleted) isAnyEvent() {}

// UnmarshalAnyEvent deserializes JSON into the correct AnyEvent concrete type
// by probing the "kind" discriminant field.
func UnmarshalAnyEvent(data []byte) (AnyEvent, error) {
    var probe struct {
        Kind json.RawMessage `json:"kind"`
    }
    if err := json.Unmarshal(data, &probe); err != nil {
        return nil, err
    }
    switch string(probe.Kind) {
    case `"Created"`:
        var v AnyEventCreated
        if err := json.Unmarshal(data, &v); err != nil {
            return nil, err
        }
        return v, nil
    case `"Deleted"`:
        var v AnyEventDeleted
        if err := json.Unmarshal(data, &v); err != nil {
            return nil, err
        }
        return v, nil
    }
    return nil, fmt.Errorf("failed to deserialize AnyEvent: unknown discriminator %s", string(probe.Kind))
}

type Archived struct {
    Kind CASE_19_DOMAIN.EventKind `json:"kind"`
    Id string `json:"id"`
}

// MixedEvent is a discriminated union on "kind".
// Possible types: MixedEventCreated, Archived
type MixedEvent interface {
    isMixedEvent()
}

// MixedEventCreated is the MixedEvent variant of CASE_19_DOMAIN.Created.
type MixedEventCreated struct {
    CASE_19_DOMAIN.Created
}

func (t MixedEventCreated) isMixedEvent() {}

func (t Archived) isMixedEvent() {}

// UnmarshalMixedEvent deserializes JSON into the correct MixedEvent concrete type
// by probing the "kind" discriminant field.
func UnmarshalMixedEvent(data []byte) (MixedEvent, error) {
    var probe struct {
        Kind json.RawMessage `json:"kind"`
    }
    if err := json.Unmarshal(data, &probe); err != nil {
        return nil, err
    }
    switch string(probe.Kind) {
    case `"Created"`:
        var v MixedEventCreated
        if err := json.Unmarshal(data, &v); err != nil {
            return nil, err
        }
        return v, nil
    case `"Archived"`:
        var v Archived
        if err := json.Unmarshal(data, &v); err != nil {
            return nil, err
        }
        return v, nil
    }
    return nil, fmt.Errorf("failed to deserialize MixedEvent: unknown discriminator %s", string(probe.Kind))
}

// AnyMessage is a discriminated union on "type".
// Possible types: AnyMessageInfo, AnyMessageAlert
type AnyMessage interface {
    isAnyMessage()
}

// AnyMessageInfo is the AnyMessage variant of CASE_19_DOMAIN.Message[CASE_19_DOMAIN.MessageType, CASE_19_DOMAIN.Notice].
type AnyMessageInfo struct {
    CASE_19_DOMAIN.Message[CASE_19_DOMAIN.MessageType, CASE_19_DOMAIN.Notice]
}

// AnyMessageAlert is the AnyMessage variant of CASE_19_DOMAIN.Message[CASE_19_DOMAIN.MessageType, CASE_19_DOMAIN.Alert].
type AnyMessageAlert struct {
    CASE_19_DOMAIN.Message[CASE_19_DOMAIN.MessageType, CASE_19_DOMAIN.Alert]
}

func (t AnyMessageInfo) isAnyMessage() {}

func (t AnyMessageAlert) isAnyMessage() {}

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
    case `"Info"`:
        var v AnyMessageInfo
        if err := json.Unmarshal(data, &v); err != nil {
            return nil, err
        }
        return v, nil
    case `"Alert"`:
        var v AnyMessageAlert
        if err := json.Unmarshal(data, &v); err != nil {
            return nil, err
        }
        return v, nil
    }
    return nil, fmt.Errorf("failed to deserialize AnyMessage: unknown discriminator %s", string(probe.Type))
}

type EventLog struct {
    Event AnyEvent `json:"event"`
    Mixed MixedEvent `json:"mixed"`
    Message AnyMessage `json:"message"`
    History []AnyEvent `json:"history"`
    Last *AnyEvent `json:"last,omitempty"`
    ById map[string]AnyEvent `json:"byId"`
}

// UnmarshalJSON deserializes the fields of EventLog whose type is a discriminated union.
func (s *EventLog) UnmarshalJSON(data []byte) error {
    type alias EventLog
    aux := struct {
        *alias
        Event json.RawMessage `json:"event"`
        Mixed json.RawMessage `json:"mixed"`
        Message json.RawMessage `json:"message"`
        History []json.RawMessage `json:"history"`
        Last json.RawMessage `json:"last"`
        ById map[string]json.RawMessage `json:"byId"`
    }{alias: (*alias)(s)}
    if err := json.Unmarshal(data, &aux); err != nil {
        return err
    }
    if len(aux.Event) > 0 && string(aux.Event) != "null" {
        v, err := UnmarshalAnyEvent(aux.Event)
        if err != nil {
            return err
        }
        s.Event = v
    }
    if len(aux.Mixed) > 0 && string(aux.Mixed) != "null" {
        v, err := UnmarshalMixedEvent(aux.Mixed)
        if err != nil {
            return err
        }
        s.Mixed = v
    }
    if len(aux.Message) > 0 && string(aux.Message) != "null" {
        v, err := UnmarshalAnyMessage(aux.Message)
        if err != nil {
            return err
        }
        s.Message = v
    }
    if aux.History != nil {
        items := make([]AnyEvent, len(aux.History))
        for i, raw := range aux.History {
            v, err := UnmarshalAnyEvent(raw)
            if err != nil {
                return err
            }
            items[i] = v
        }
        s.History = items
    }
    if len(aux.Last) > 0 && string(aux.Last) != "null" {
        v, err := UnmarshalAnyEvent(aux.Last)
        if err != nil {
            return err
        }
        s.Last = &v
    }
    if aux.ById != nil {
        items := make(map[string]AnyEvent, len(aux.ById))
        for k, raw := range aux.ById {
            v, err := UnmarshalAnyEvent(raw)
            if err != nil {
                return err
            }
            items[k] = v
        }
        s.ById = items
    }
    return nil
}

