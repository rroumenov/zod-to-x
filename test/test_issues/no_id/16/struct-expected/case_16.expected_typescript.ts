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
    destination: ShippingAddress;
    billing?: ShippingAddress;
    items: OrderItem[];
    currency: CASE_16_DOMAIN.Currency;
    contact: Contact;
}

export interface OrderItemPage extends CASE_16_DOMAIN.Page<OrderItem> {}
