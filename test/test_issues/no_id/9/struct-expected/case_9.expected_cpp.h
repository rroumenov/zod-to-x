#pragma once

#include "case_9_domain.hpp"
#include <nlohmann/json.hpp>
#include <string>

namespace CASE_9_APP {
    struct Wrapper {
        CASE_9_DOMAIN::User domain_user;
    };

    struct User {
        std::string name;
        bool is_admin;
    };

}

namespace CASE_9_APP {
    inline void to_json(nlohmann::json& j, const Wrapper& x) {
        j["domainUser"] = x.domain_user;
    }

    inline void from_json(const nlohmann::json& j, Wrapper& x) {
        x.domain_user = j.at("domainUser").get<CASE_9_DOMAIN::User>();
    }

    inline void to_json(nlohmann::json& j, const User& x) {
        j["name"] = x.name;
        j["isAdmin"] = x.is_admin;
    }

    inline void from_json(const nlohmann::json& j, User& x) {
        x.name = j.at("name").get<std::string>();
        x.is_admin = j.at("isAdmin").get<bool>();
    }

}