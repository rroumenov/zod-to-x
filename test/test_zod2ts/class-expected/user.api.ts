// This is
// a multiline
// header.

import * as USER_DTOS from "./user.dtos";

export class ReqUpdateUser extends USER_DTOS.UpdateUserUseCaseDto {}

export class ResUpdateUser extends USER_DTOS.UpdateUserUseCaseResultDto {}

export class ResUpdateUserMulti {
    amount: number;
    data: USER_DTOS.UpdateUserUseCaseResultDto[];

    constructor(data: ResUpdateUserMulti) {
        this.amount = data.amount;
        this.data = data.data;
    }
}

export class UserApi {
    reqUpdateUser: ReqUpdateUser;
    resUpdateUser: ResUpdateUser;
    resUpdateUserMulti: ResUpdateUserMulti;

    constructor(data: UserApi) {
        this.reqUpdateUser = data.reqUpdateUser;
        this.resUpdateUser = data.resUpdateUser;
        this.resUpdateUserMulti = data.resUpdateUserMulti;
    }
}
