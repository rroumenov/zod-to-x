// Account status
export enum Status {
    Active = "Active",
    Inactive = "Inactive",
}

// Postal address
export interface Address {
    street: string;
    city: string;
}

export interface Account {
    id: string;
    status: Status;
    address: Address;
}
