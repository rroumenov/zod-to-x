// This is
// a multiline
// header.

package models

// GenericUserEntity
type GenericUserEntity[T any] struct {
    Id string `json:"id"`
    Name string `json:"name"`
    Email string `json:"email"`
    Age *int64 `json:"age,omitempty"`
    Metadata T `json:"metadata"`
}

// NormalUserMetadata
type NormalUserMetadata struct {
    FavoriteColor string `json:"favoriteColor"`
    Hobbies []string `json:"hobbies"`
}

type NormalUserEntity struct {
    GenericUserEntity[NormalUserMetadata]
}

// AdminUserMetadata
type AdminUserMetadata struct {
    AdminLevel int64 `json:"adminLevel"`
    Permissions []string `json:"permissions"`
}

type AdminUserEntity struct {
    GenericUserEntity[AdminUserMetadata]
}

type RecordStringAny = map[string]any

// UserEntities
// UserEntities is a union of: NormalUserEntity, AdminUserEntity, GenericUserEntity[RecordStringAny]
type UserEntities = any
