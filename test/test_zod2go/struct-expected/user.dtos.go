// This is
// a multiline
// header.

package models

import (
	"time"
	USER "./user.entity"
)

type CreateUserUseCaseDto struct {
    Name string `json:"name"`
    Email string `json:"email"`
    Age *int64 `json:"age,omitempty"`
    Role USER.UserRole `json:"role"`
}

type CreateUserUseCaseResultDto struct {
    Id string `json:"id"`
    Name string `json:"name"`
    Email string `json:"email"`
    Age *int64 `json:"age,omitempty"`
    CreatedAt time.Time `json:"createdAt"`
    UpdatedAt time.Time `json:"updatedAt"`
}

type UpdateUserUseCaseDto struct {
    CreateUserUseCaseDto
}

type UpdateUserUseCaseResultDto struct {
    USER.UserEntity
}

type UserDtos struct {
    CreateUserUseCaseDto CreateUserUseCaseDto `json:"createUserUseCaseDto"`
    CreateUserUseCaseResultDto CreateUserUseCaseResultDto `json:"createUserUseCaseResultDto"`
    UpdateUserUseCaseDto UpdateUserUseCaseDto `json:"updateUserUseCaseDto"`
    UpdateUserUseCaseResultDto UpdateUserUseCaseResultDto `json:"updateUserUseCaseResultDto"`
}
