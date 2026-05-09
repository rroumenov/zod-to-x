// This is
// a multiline
// header.

package models

import USER_DTOS "./user.dtos"

type ReqUpdateUser struct {
    USER_DTOS.UpdateUserUseCaseDto
}

type ResUpdateUser struct {
    USER_DTOS.UpdateUserUseCaseResultDto
}

type ResUpdateUserMulti struct {
    Amount int64 `json:"amount"`
    Data []USER_DTOS.UpdateUserUseCaseResultDto `json:"data"`
}

type UserApi struct {
    ReqUpdateUser ReqUpdateUser `json:"reqUpdateUser"`
    ResUpdateUser ResUpdateUser `json:"resUpdateUser"`
    ResUpdateUserMulti ResUpdateUserMulti `json:"resUpdateUserMulti"`
}
