// This is
// a multiline
// header.

import * as USER from "./user.entity";

export interface CreateUserUseCaseDto {
    name: string;
    email: string;
    age?: number;
    role: USER.UserRole;
}

export interface CreateUserUseCaseResultDto {
    id: string;
    name: string;
    email: string;
    age?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface UpdateUserUseCaseResultDto extends USER.UserEntity {}

export interface UserDtos {
    createUserUseCaseDto: CreateUserUseCaseDto;
    createUserUseCaseResultDto: CreateUserUseCaseResultDto;
    updateUserUseCaseDto: CreateUserUseCaseDto;
    updateUserUseCaseResultDto: UpdateUserUseCaseResultDto;
}
