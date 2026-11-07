package models

import (
	"encoding/json"
	CASE_20_DOMAIN "./case_20_domain"
)

type Usage struct {
    ItemBox CASE_20_DOMAIN.ItemBox `json:"itemBox"`
    StrBox CASE_20_DOMAIN.StrBox `json:"strBox"`
    SortBox CASE_20_DOMAIN.SortBox `json:"sortBox"`
    ItemPair CASE_20_DOMAIN.ItemPair `json:"itemPair"`
    Pairs []CASE_20_DOMAIN.ItemPair `json:"pairs"`
    Message CASE_20_DOMAIN.AnyMessage `json:"message"`
}

// UnmarshalJSON deserializes the fields of Usage whose type is a discriminated union.
func (s *Usage) UnmarshalJSON(data []byte) error {
    type alias Usage
    aux := struct {
        *alias
        Message json.RawMessage `json:"message"`
    }{alias: (*alias)(s)}
    if err := json.Unmarshal(data, &aux); err != nil {
        return err
    }
    if len(aux.Message) > 0 && string(aux.Message) != "null" {
        v, err := CASE_20_DOMAIN.UnmarshalAnyMessage(aux.Message)
        if err != nil {
            return err
        }
        s.Message = v
    }
    return nil
}

