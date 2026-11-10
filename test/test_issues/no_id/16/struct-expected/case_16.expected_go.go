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
    Destination CASE_16_DOMAIN.Address `json:"destination"`
    // Billing address
    Billing *CASE_16_DOMAIN.Address `json:"billing,omitempty"`
    Items []CASE_16_DOMAIN.Item `json:"items"`
    Currency CASE_16_DOMAIN.Currency `json:"currency"`
    Contact Contact `json:"contact"`
}

type AddressList = []CASE_16_DOMAIN.Address

type OrderItemPage struct {
    CASE_16_DOMAIN.Page[CASE_16_DOMAIN.Item]
}
