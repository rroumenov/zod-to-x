import * as CASE_16_DOMAIN from "./case_16_domain";

export class ShippingAddress extends CASE_16_DOMAIN.Address {}

export class OrderItem extends CASE_16_DOMAIN.Item {}

export type PaymentCurrency = CASE_16_DOMAIN.Currency;

export type RefundCurrency = CASE_16_DOMAIN.Currency;

export class Contact {
    email: string;

    constructor(data: Contact) {
        this.email = data.email;
    }
}

export class Customer extends Contact {}

export class Order {
    id: string;
    destination: ShippingAddress;
    billing?: ShippingAddress;
    items: OrderItem[];
    currency: CASE_16_DOMAIN.Currency;
    contact: Contact;

    constructor(data: Order) {
        this.id = data.id;
        this.destination = data.destination;
        this.billing = data.billing;
        this.items = data.items;
        this.currency = data.currency;
        this.contact = data.contact;
    }
}

export class OrderItemPage extends CASE_16_DOMAIN.Page<OrderItem> {}
