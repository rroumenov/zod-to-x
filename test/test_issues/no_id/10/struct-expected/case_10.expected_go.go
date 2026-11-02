package models

// Account status
type Status string

const (
    StatusActive Status = "Active"
    StatusInactive Status = "Inactive"
)

// Postal address
type Address struct {
    Street string `json:"street"`
    City string `json:"city"`
}

type Account struct {
    Id string `json:"id"`
    Status Status `json:"status"`
    Address Address `json:"address"`
}
