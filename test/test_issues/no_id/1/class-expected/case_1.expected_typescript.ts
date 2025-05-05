import * as USER from "./user.entity";

export class UserConfigAdmin {
    role: USER.UserRole.Admin;
    permissions: string[];

    constructor(data: UserConfigAdmin) {
        this.role = data.role;
        this.permissions = data.permissions;
    }
}

export class UserConfigUser {
    role: USER.UserRole.User;
    banned: boolean;

    constructor(data: UserConfigUser) {
        this.role = data.role;
        this.banned = data.banned;
    }
}

export type UserConfig = UserConfigAdmin | UserConfigUser;

export class UserDtos {
    userConfigAdmin: UserConfigAdmin;
    userConfigUser: UserConfigUser;
    userConfig: UserConfig;

    constructor(data: UserDtos) {
        this.userConfigAdmin = data.userConfigAdmin;
        this.userConfigUser = data.userConfigUser;
        this.userConfig = data.userConfig;
    }
}