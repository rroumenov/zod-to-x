import * as CASE_21_DOMAIN from "./case_21_domain";

// Identifier of the UTM campaign.
export type UtmId = CASE_21_DOMAIN.Uuid;

// Where the order is sent.
export class ShippingAddress extends CASE_21_DOMAIN.Address {}

// Currency of the payment.
export type PaymentCurrency = CASE_21_DOMAIN.Currency;

// Tags of the order.
export type OrderTags = CASE_21_DOMAIN.Tags;

// Description of the alias.
export type Renamed = CASE_21_DOMAIN.Documented;

// Description of the base type.
export type Restated = CASE_21_DOMAIN.Documented;

export type Inherited = CASE_21_DOMAIN.Documented;

export type Undocumented = CASE_21_DOMAIN.Uuid;

export class Contact {
    email: string;

    constructor(data: Contact) {
        this.email = data.email;
    }
}

// Contact that places the order.
export class Customer extends Contact {}

export class Order {
    // Field redefining the base description.
    redefined: CASE_21_DOMAIN.Documented;
    // Description of the base type.
    restated: CASE_21_DOMAIN.Documented;
    // Field documenting an undocumented type.
    documented: CASE_21_DOMAIN.Uuid;
    // Described before optional.
    describedBefore?: CASE_21_DOMAIN.Uuid;
    // Described after optional.
    describedAfter?: CASE_21_DOMAIN.Uuid;
    // List of identifiers.
    list: CASE_21_DOMAIN.Uuid[];
    // Field of an object type.
    address: CASE_21_DOMAIN.Address;
    // Field of an enum type.
    currency: CASE_21_DOMAIN.Currency;
    // Field of a basic type.
    local: string;
    plain: CASE_21_DOMAIN.Documented;
    plainOptional?: CASE_21_DOMAIN.Documented;

    constructor(data: Order) {
        this.redefined = data.redefined;
        this.restated = data.restated;
        this.documented = data.documented;
        this.describedBefore = data.describedBefore;
        this.describedAfter = data.describedAfter;
        this.list = data.list;
        this.address = data.address;
        this.currency = data.currency;
        this.local = data.local;
        this.plain = data.plain;
        this.plainOptional = data.plainOptional;
    }
}
