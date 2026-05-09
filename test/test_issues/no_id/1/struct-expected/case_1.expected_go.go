package models

import (
	"encoding/json"
	"fmt"
	USER "./user.entity"
)

type UserConfigAdmin struct {
    Role USER.UserRole `json:"role"`
    Permissions []string `json:"permissions"`
}

type UserConfigUser struct {
    Role USER.UserRole `json:"role"`
    Banned bool `json:"banned"`
}

// UserConfig is a discriminated union on "role".
// Possible types: UserConfigAdmin, UserConfigUser
type UserConfig interface {
    isUserConfig()
}

func (t UserConfigAdmin) isUserConfig() {}

func (t UserConfigUser) isUserConfig() {}

// UnmarshalUserConfig deserializes JSON into the correct UserConfig concrete type
// by probing the "role" discriminant field.
func UnmarshalUserConfig(data []byte) (UserConfig, error) {
    var probe struct {
        Role json.RawMessage `json:"role"`
    }
    if err := json.Unmarshal(data, &probe); err != nil {
        return nil, err
    }
    switch string(probe.Role) {
    case `"Admin"`:
        var v UserConfigAdmin
        if err := json.Unmarshal(data, &v); err != nil {
            return nil, err
        }
        return v, nil
    case `"User"`:
        var v UserConfigUser
        if err := json.Unmarshal(data, &v); err != nil {
            return nil, err
        }
        return v, nil
    }
    return nil, fmt.Errorf("failed to deserialize UserConfig: unknown discriminator %s", string(probe.Role))
}
