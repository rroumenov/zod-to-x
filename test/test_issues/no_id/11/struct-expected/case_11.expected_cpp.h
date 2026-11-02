#pragma once

#include <nlohmann/json.hpp>
#include <string>
#include <vector>

namespace CASE_11_DOMAIN {
    struct UserEntity {
        std::string id;
        std::string name;
    };

    struct Group {
        UserEntity owner;
        std::vector<UserEntity> members;
    };

}

namespace CASE_11_DOMAIN {
    inline void to_json(nlohmann::json& j, const UserEntity& x) {
        j["id"] = x.id;
        j["name"] = x.name;
    }

    inline void from_json(const nlohmann::json& j, UserEntity& x) {
        x.id = j.at("id").get<std::string>();
        x.name = j.at("name").get<std::string>();
    }

    inline void to_json(nlohmann::json& j, const Group& x) {
        j["owner"] = x.owner;
        j["members"] = x.members;
    }

    inline void from_json(const nlohmann::json& j, Group& x) {
        x.owner = j.at("owner").get<UserEntity>();
        x.members = j.at("members").get<std::vector<UserEntity>>();
    }

}