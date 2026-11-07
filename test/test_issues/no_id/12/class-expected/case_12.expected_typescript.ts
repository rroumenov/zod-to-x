import * as CASE_12_DOMAIN from "./case_12_domain";

export class ShippingAddress extends CASE_12_DOMAIN.Address {}

export class ShippingRequest {
    orderId: string;
    destination: CASE_12_DOMAIN.Address;

    constructor(data: ShippingRequest) {
        this.orderId = data.orderId;
        this.destination = data.destination;
    }
}
