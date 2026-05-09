// This is
// a multiline
// header.

package models

import (
	"encoding/json"
	"fmt"
	GENERICS_APP "./layered_generics.app"
)

type HttpSuccessfulResponse[T any] struct {
    Success bool `json:"success"`
    Data T `json:"data"`
}

type HttpUnsuccessfulResponse struct {
    Success bool `json:"success"`
    Message string `json:"message"`
    Details *map[string]any `json:"details,omitempty"`
}

type HttpErrorResponse struct {
    Message string `json:"message"`
}

type SomeDtoResult struct {
    Id string `json:"id"`
    Name string `json:"name"`
    Age int64 `json:"age"`
}

type InternalObjectWithGeneric struct {
    HttpSuccessfulResponse[SomeDtoResult]
}

type ObjectWithGeneric struct {
    Internal InternalObjectWithGeneric `json:"internal"`
    Item HttpSuccessfulResponse[SomeDtoResult] `json:"item"`
    UserItem GENERICS_APP.GenericUserEntity[SomeDtoResult] `json:"userItem"`
    OtherUserItem GENERICS_APP.AdminUserEntity `json:"otherUserItem"`
}

type OtherDtoResult struct {
    Code string `json:"code"`
    Description string `json:"description"`
}

type DataRetrieve struct {
    HttpSuccessfulResponse[SomeDtoResult]
}

// DiscriminantDataRetrieve is a discriminated union on "success".
// Possible types: HttpSuccessfulResponse[SomeDtoResult], HttpUnsuccessfulResponse
type DiscriminantDataRetrieve interface {
    isDiscriminantDataRetrieve()
}

func (t HttpSuccessfulResponse[T]) isDiscriminantDataRetrieve() {}

func (t HttpUnsuccessfulResponse) isDiscriminantDataRetrieve() {}

// UnmarshalDiscriminantDataRetrieve deserializes JSON into the correct DiscriminantDataRetrieve concrete type
// by probing the "success" discriminant field.
func UnmarshalDiscriminantDataRetrieve(data []byte) (DiscriminantDataRetrieve, error) {
    var probe struct {
        Success json.RawMessage `json:"success"`
    }
    if err := json.Unmarshal(data, &probe); err != nil {
        return nil, err
    }
    switch string(probe.Success) {
    case "true":
        var v HttpSuccessfulResponse[SomeDtoResult]
        if err := json.Unmarshal(data, &v); err != nil {
            return nil, err
        }
        return v, nil
    case "false":
        var v HttpUnsuccessfulResponse
        if err := json.Unmarshal(data, &v); err != nil {
            return nil, err
        }
        return v, nil
    }
    return nil, fmt.Errorf("failed to deserialize DiscriminantDataRetrieve: unknown discriminator %s", string(probe.Success))
}

type IntersectedDataRetrieve struct {
    Success bool `json:"success"`
    Data SomeDtoResult `json:"data"`
    Id string `json:"id"`
    Name string `json:"name"`
    Email string `json:"email"`
    Age *int64 `json:"age,omitempty"`
    Metadata OtherDtoResult `json:"metadata"`
}

type UserRetrieve struct {
    HttpSuccessfulResponse[GENERICS_APP.NormalUserEntity]
}
