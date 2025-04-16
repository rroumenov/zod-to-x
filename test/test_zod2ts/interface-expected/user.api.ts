// This is
// a multiline
// header.

import * as USER_DTOS from "./user.dtos";

export interface ReqUpdateUser extends USER_DTOS.CreateUserUseCaseDto {}

export interface ResUpdateUser extends USER_DTOS.UpdateUserUseCaseResultDto {}

export interface ResUpdateUserMulti {
    amount: number;
    data: USER_DTOS.UpdateUserUseCaseResultDto[];
}

export interface UserApi {
    reqUpdateUser: ReqUpdateUser;
    resUpdateUser: ResUpdateUser;
    resUpdateUserMulti: ResUpdateUserMulti;
}
