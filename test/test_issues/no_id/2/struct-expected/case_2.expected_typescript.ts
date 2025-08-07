export interface CreateUserDto {
    name: string;
    permissions: string[];
}

export interface UpdateUserDto extends CreateUserDto {}