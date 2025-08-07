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
    class ReqUpdateUser : public USER_DTOS::UpdateUserUseCaseDto {};

    class ResUpdateUser : public USER_DTOS::UpdateUserUseCaseResultDto {};

    class ResUpdateUserMulti {
    private:
        std::uint64_t amount;
        std::vector<USER_DTOS::UpdateUserUseCaseResultDto> data;
    
    public:
        ResUpdateUserMulti() = default;
        virtual ~ResUpdateUserMulti() = default;
        
        const std::uint64_t& get_amount() const { return this->amount; }
        std::uint64_t& get_mut_amount() { return this->amount; }
        void set_amount(const std::uint64_t& value) { this->amount = value; }
        
        const std::vector<USER_DTOS::UpdateUserUseCaseResultDto>& get_data() const { return this->data; }
        std::vector<USER_DTOS::UpdateUserUseCaseResultDto>& get_mut_data() { return this->data; }
        void set_data(const std::vector<USER_DTOS::UpdateUserUseCaseResultDto>& value) { this->data = value; }
    };

    class UserApi {
    private:
        ReqUpdateUser req_update_user;
        ResUpdateUser res_update_user;
        ResUpdateUserMulti res_update_user_multi;
    
    public:
        UserApi() = default;
        virtual ~UserApi() = default;
        
        const ReqUpdateUser& get_req_update_user() const { return this->req_update_user; }
        ReqUpdateUser& get_mut_req_update_user() { return this->req_update_user; }
        void set_req_update_user(const ReqUpdateUser& value) { this->req_update_user = value; }
        
        const ResUpdateUser& get_res_update_user() const { return this->res_update_user; }
        ResUpdateUser& get_mut_res_update_user() { return this->res_update_user; }
        void set_res_update_user(const ResUpdateUser& value) { this->res_update_user = value; }
        
        const ResUpdateUserMulti& get_res_update_user_multi() const { return this->res_update_user_multi; }
        ResUpdateUserMulti& get_mut_res_update_user_multi() { return this->res_update_user_multi; }
        void set_res_update_user_multi(const ResUpdateUserMulti& value) { this->res_update_user_multi = value; }
    };

}

namespace USER_API {
    inline void to_json(json& j, const ResUpdateUserMulti& x) {
        j["amount"] = x.get_amount();
        j["data"] = x.get_data();
    }

    inline void from_json(const json& j, ResUpdateUserMulti& x) {
        x.set_amount(j.at("amount").get<std::uint64_t>());
        x.set_data(j.at("data").get<std::vector<USER_DTOS::UpdateUserUseCaseResultDto>>());
    }

    inline void to_json(json& j, const UserApi& x) {
        j["reqUpdateUser"] = x.get_req_update_user();
        j["resUpdateUser"] = x.get_res_update_user();
        j["resUpdateUserMulti"] = x.get_res_update_user_multi();
    }

    inline void from_json(const json& j, UserApi& x) {
        x.set_req_update_user(j.at("reqUpdateUser").get<ReqUpdateUser>());
        x.set_res_update_user(j.at("resUpdateUser").get<ResUpdateUser>());
        x.set_res_update_user_multi(j.at("resUpdateUserMulti").get<ResUpdateUserMulti>());
    }

}