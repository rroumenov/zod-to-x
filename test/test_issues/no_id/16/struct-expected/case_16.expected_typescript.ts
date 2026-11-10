import * as CASE_16_DOMAIN from "./case_16_domain";

export interface ShippingAddress extends CASE_16_DOMAIN.Address {}

export interface OrderItem extends CASE_16_DOMAIN.Item {}

export type PaymentCurrency = CASE_16_DOMAIN.Currency;

export type RefundCurrency = CASE_16_DOMAIN.Currency;

export interface Contact {
    email: string;
}

export interface Customer extends Contact {}

export interface Order {
    id: string;
    destination: CASE_16_DOMAIN.Address;
    // Billing address
    billing?: CASE_16_DOMAIN.Address;
    items: CASE_16_DOMAIN.Item[];
    currency: CASE_16_DOMAIN.Currency;
    contact: Contact;
}

export type AddressList = CASE_16_DOMAIN.Address[];

export interface OrderItemPage extends CASE_16_DOMAIN.Page<CASE_16_DOMAIN.Item> {}
