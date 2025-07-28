// This is
// a multiline
// header.

#pragma once

#include "user.dtos.hpp"
#include <cstdint>
#include <nlohmann/json.hpp>
#include <vector>

using nlohmann::json;

namespace USER_API {
    struct ReqUpdateUser : public USER_DTOS::UpdateUserUseCaseDto {};

    struct ResUpdateUser : public USER_DTOS::UpdateUserUseCaseResultDto {};

    struct ResUpdateUserMulti {
        std::uint64_t amount;
        std::vector<USER_DTOS::UpdateUserUseCaseResultDto> data;
    };

    struct UserApi {
        ReqUpdateUser req_update_user;
        ResUpdateUser res_update_user;
        ResUpdateUserMulti res_update_user_multi;
    };

}

namespace USER_API {
    inline void to_json(json& j, const ResUpdateUserMulti& x) {
        j["amount"] = x.amount;
        j["data"] = x.data;
    }

    inline void from_json(const json& j, ResUpdateUserMulti& x) {
        x.amount = j.at("amount").get<std::uint64_t>();
        x.data = j.at("data").get<std::vector<USER_DTOS::UpdateUserUseCaseResultDto>>();
    }

    inline void to_json(json& j, const UserApi& x) {
        j["reqUpdateUser"] = x.req_update_user;
        j["resUpdateUser"] = x.res_update_user;
        j["resUpdateUserMulti"] = x.res_update_user_multi;
    }

    inline void from_json(const json& j, UserApi& x) {
        x.req_update_user = j.at("reqUpdateUser").get<ReqUpdateUser>();
        x.res_update_user = j.at("resUpdateUser").get<ResUpdateUser>();
        x.res_update_user_multi = j.at("resUpdateUserMulti").get<ResUpdateUserMulti>();
    }

}