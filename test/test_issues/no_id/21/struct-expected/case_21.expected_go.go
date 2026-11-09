package models

import CASE_21_DOMAIN "./case_21_domain"

// Identifier of the UTM campaign.
type UtmId = CASE_21_DOMAIN.Uuid

// Where the order is sent.
type ShippingAddress struct {
    CASE_21_DOMAIN.Address
}

// Currency of the payment.
type PaymentCurrency = CASE_21_DOMAIN.Currency

// Tags of the order.
type OrderTags = CASE_21_DOMAIN.Tags

// Description of the alias.
type Renamed = CASE_21_DOMAIN.Documented

type Inherited = CASE_21_DOMAIN.Documented

type Undocumented = CASE_21_DOMAIN.Uuid

type Contact struct {
    Email string `json:"email"`
}

// Contact that places the order.
type Customer struct {
    Contact
}
