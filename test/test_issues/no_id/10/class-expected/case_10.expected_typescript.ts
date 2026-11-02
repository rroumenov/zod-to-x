// Account status
export enum Status {
    Active = "Active",
    Inactive = "Inactive",
}

// Postal address
export class Address {
    street: string;
    city: string;

    constructor(data: Address) {
        this.street = data.street;
        this.city = data.city;
    }
}

export class Account {
    id: string;
    status: Status;
    address: Address;

    constructor(data: Account) {
        this.id = data.id;
        this.status = data.status;
        this.address = data.address;
    }
}
