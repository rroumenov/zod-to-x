import * as CASE_12_DOMAIN from "./case_12_domain";

export interface ShippingAddress extends CASE_12_DOMAIN.Address {}

export interface ShippingRequest {
    orderId: string;
    destination: ShippingAddress;
}
