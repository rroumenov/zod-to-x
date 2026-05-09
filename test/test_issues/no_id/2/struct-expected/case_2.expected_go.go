package models

type CreateUserDto struct {
    Name string `json:"name"`
    Permissions []string `json:"permissions"`
}

type UpdateUserDto struct {
    CreateUserDto
}
