package models

import CASE_16_DOMAIN "./case_16_domain"

type ShippingAddress struct {
    CASE_16_DOMAIN.Address
}

type OrderItem struct {
    CASE_16_DOMAIN.Item
}

type PaymentCurrency = CASE_16_DOMAIN.Currency

type RefundCurrency = CASE_16_DOMAIN.Currency

type Contact struct {
    Email string `json:"email"`
}

type Customer struct {
    Contact
}

type Order struct {
    Id string `json:"id"`
    Destination ShippingAddress `json:"destination"`
    Billing *ShippingAddress `json:"billing,omitempty"`
    Items []OrderItem `json:"items"`
    Currency CASE_16_DOMAIN.Currency `json:"currency"`
    Contact Contact `json:"contact"`
}

type OrderItemPage struct {
    CASE_16_DOMAIN.Page[OrderItem]
}
