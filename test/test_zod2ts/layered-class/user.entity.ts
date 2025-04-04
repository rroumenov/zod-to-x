// This is
// a multiline
// header.
export enum UserRole {
    Admin = "Admin",
    User = "User",
}

export class UserEntity {
    id: string;
    name: string;
    email: string;
    age?: number;
    role: UserRole;

    constructor(data: UserEntity) {
        this.id = data.id;
        this.name = data.name;
        this.email = data.email;
        this.age = data.age;
        this.role = data.role;
    }
}

export class UserModels {
    userRole: UserRole;
    userEntity: UserEntity;

    constructor(data: UserModels) {
        this.userRole = data.userRole;
        this.userEntity = data.userEntity;
    }
}
