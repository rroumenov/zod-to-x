package models

import CASE_12_DOMAIN "./case_12_domain"

type ShippingAddress struct {
    CASE_12_DOMAIN.Address
}

type ShippingRequest struct {
    OrderId string `json:"orderId"`
    Destination CASE_12_DOMAIN.Address `json:"destination"`
}
