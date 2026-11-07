package models

type UserEntity struct {
    Id string `json:"id"`
    Name string `json:"name"`
}

type Group struct {
    Owner UserEntity `json:"owner"`
    Members []UserEntity `json:"members"`
}
