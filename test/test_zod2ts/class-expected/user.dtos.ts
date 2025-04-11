// This is
// a multiline
// header.

import * as USER from "./user.entity";

export class CreateUserUseCaseDto {
    name: string;
    email: string;
    age?: number;
    role: USER.UserRole;

    constructor(data: CreateUserUseCaseDto) {
        this.name = data.name;
        this.email = data.email;
        this.age = data.age;
        this.role = data.role;
    }
}

export class CreateUserUseCaseResultDto {
    id: string;
    name: string;
    email: string;
    age?: number;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: CreateUserUseCaseResultDto) {
        this.id = data.id;
        this.name = data.name;
        this.email = data.email;
        this.age = data.age;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}

export class UserDtos {
    createUserUseCaseDto: CreateUserUseCaseDto;
    createUserUseCaseResultDto: CreateUserUseCaseResultDto;

    constructor(data: UserDtos) {
        this.createUserUseCaseDto = data.createUserUseCaseDto;
        this.createUserUseCaseResultDto = data.createUserUseCaseResultDto;
    }
}
