import * as CASE_15_DOMAIN from "./case_15_domain";

export interface Price extends CASE_15_DOMAIN.Money {}

export interface Invoice {
    id: string;
    total: Price;
}
