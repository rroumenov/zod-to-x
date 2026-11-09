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

// Description of the base type.
type Restated = CASE_21_DOMAIN.Documented

type Inherited = CASE_21_DOMAIN.Documented

type Undocumented = CASE_21_DOMAIN.Uuid

type Contact struct {
    Email string `json:"email"`
}

// Contact that places the order.
type Customer struct {
    Contact
}

type Order struct {
    // Field redefining the base description.
    Redefined CASE_21_DOMAIN.Documented `json:"redefined"`
    // Description of the base type.
    Restated CASE_21_DOMAIN.Documented `json:"restated"`
    // Field documenting an undocumented type.
    Documented CASE_21_DOMAIN.Uuid `json:"documented"`
    // Described before optional.
    DescribedBefore *CASE_21_DOMAIN.Uuid `json:"describedBefore,omitempty"`
    // Described after optional.
    DescribedAfter *CASE_21_DOMAIN.Uuid `json:"describedAfter,omitempty"`
    // List of identifiers.
    List []CASE_21_DOMAIN.Uuid `json:"list"`
    // Field of an object type.
    Address CASE_21_DOMAIN.Address `json:"address"`
    // Field of an enum type.
    Currency CASE_21_DOMAIN.Currency `json:"currency"`
    // Field of a basic type.
    Local string `json:"local"`
    Plain CASE_21_DOMAIN.Documented `json:"plain"`
    PlainOptional *CASE_21_DOMAIN.Documented `json:"plainOptional,omitempty"`
}
