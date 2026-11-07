import * as CASE_15_DOMAIN from "./case_15_domain";

export class Price extends CASE_15_DOMAIN.Money {}

export class Invoice {
    id: string;
    total: CASE_15_DOMAIN.Money;

    constructor(data: Invoice) {
        this.id = data.id;
        this.total = data.total;
    }
}
