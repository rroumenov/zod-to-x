import * as CASE_9_DOMAIN from "./case_9_domain";

export class Wrapper {
    domainUser: CASE_9_DOMAIN.User;

    constructor(data: Wrapper) {
        this.domainUser = data.domainUser;
    }
}

export class User {
    name: string;
    isAdmin: boolean;

    constructor(data: User) {
        this.name = data.name;
        this.isAdmin = data.isAdmin;
    }
}
