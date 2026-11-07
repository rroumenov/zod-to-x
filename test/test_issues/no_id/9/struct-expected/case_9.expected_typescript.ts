import * as CASE_9_DOMAIN from "./case_9_domain";

export interface Wrapper {
    domainUser: CASE_9_DOMAIN.User;
}

export interface User {
    name: string;
    isAdmin: boolean;
}
