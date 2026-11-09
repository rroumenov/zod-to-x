import * as CASE_21_DOMAIN from "./case_21_domain";

// Identifier of the UTM campaign.
export type UtmId = CASE_21_DOMAIN.Uuid;

// Where the order is sent.
export interface ShippingAddress extends CASE_21_DOMAIN.Address {}

// Currency of the payment.
export type PaymentCurrency = CASE_21_DOMAIN.Currency;

// Tags of the order.
export type OrderTags = CASE_21_DOMAIN.Tags;

// Description of the alias.
export type Renamed = CASE_21_DOMAIN.Documented;

export type Inherited = CASE_21_DOMAIN.Documented;

export type Undocumented = CASE_21_DOMAIN.Uuid;

export interface Contact {
    email: string;
}

// Contact that places the order.
export interface Customer extends Contact {}
