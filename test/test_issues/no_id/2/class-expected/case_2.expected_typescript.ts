export class CreateUserDto {
    name: string;
    permissions: string[];

    constructor(data: CreateUserDto) {
        this.name = data.name;
        this.permissions = data.permissions;
    }
}

export class UpdateUserDto extends CreateUserDto {}