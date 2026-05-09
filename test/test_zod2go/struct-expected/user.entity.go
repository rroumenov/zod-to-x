// This is
// a multiline
// header.

package models

type UserRole string

const (
    UserRoleAdmin UserRole = "Admin"
    UserRoleUser UserRole = "User"
)

type UserEntity struct {
    Id string `json:"id"`
    Name string `json:"name"`
    Email string `json:"email"`
    Age *int64 `json:"age,omitempty"`
    Role UserRole `json:"role"`
}

type UserModels struct {
    UserRole UserRole `json:"userRole"`
    UserEntity UserEntity `json:"userEntity"`
}
