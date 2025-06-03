import * as USER from "./user.entity";

export interface UserConfigAdmin {
    role: USER.UserRole.Admin;
    permissions: string[];
}

export interface UserConfigUser {
    role: USER.UserRole.User;
    banned: boolean;
}

export type UserConfig = UserConfigAdmin | UserConfigUser;