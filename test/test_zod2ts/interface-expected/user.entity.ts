// This is
// a multiline
// header.

export enum UserRole {
    Admin = "Admin",
    User = "User",
}

export interface UserEntity {
    id: string;
    name: string;
    email: string;
    age?: number;
    role: UserRole;
}

export interface UserModels {
    userRole: UserRole;
    userEntity: UserEntity;
}
