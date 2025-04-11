// This is
// a multiline
// header.

#pragma once

#include <boost/optional.hpp>
#include <cstdint>
#include <nlohmann/json.hpp>
#include <stdexcept>
#include <string>

using nlohmann::json;

namespace USER {
    enum class UserRole: int {
        Admin,
        User
    };

    struct UserEntity {
        std::string id;
        std::string name;
        std::string email;
        boost::optional<std::uint64_t> age;
        UserRole role;
    };

    struct UserModels {
        UserRole user_role;
        UserEntity user_entity;
    };

}

namespace USER {
    #ifndef NLOHMANN_OPTIONAL_HELPER_USER
    #define NLOHMANN_OPTIONAL_HELPER_USER
    template <typename T>
    boost::optional<T> get_opt(const json& j, const std::string& key) {
        auto it = j.find(key);
        if (it != j.end() && !it->is_null()) {
            return it->get<T>();
        }
        return boost::optional<T>();
    }

    template <typename T>
    void set_opt(json& j, const std::string& key, const boost::optional<T>& opt) {
        if (opt) {
            j[key] = *opt;
        }
        else {
            j[key] = nullptr;
        }
    }
    #endif

    inline void to_json(json& j, const UserRole& x) {
        switch (x) {
            case UserRole::Admin: j = "Admin"; break;
            case UserRole::User: j = "User"; break;
            default: throw std::runtime_error("Unexpected value serializing enum UserRole: " + std::to_string(static_cast<int>(x)));
        }
    }

    inline void from_json(const json& j, UserRole& x) {
        if (j == "Admin") x = UserRole::Admin;
        else if (j == "User") x = UserRole::User;
        else { throw std::runtime_error("Unexpected value deserializing enum UserRole."); }
    }

    inline void to_json(json& j, const UserEntity& x) {
        j["id"] = x.id;
        j["name"] = x.name;
        j["email"] = x.email;
        set_opt<std::uint64_t>(j, "age", x.age);
        j["role"] = x.role;
    }

    inline void from_json(const json& j, UserEntity& x) {
        x.id = j.at("id").get<std::string>();
        x.name = j.at("name").get<std::string>();
        x.email = j.at("email").get<std::string>();
        x.age = get_opt<std::uint64_t>(j, "age");
        x.role = j.at("role").get<UserRole>();
    }

    inline void to_json(json& j, const UserModels& x) {
        j["userRole"] = x.user_role;
        j["userEntity"] = x.user_entity;
    }

    inline void from_json(const json& j, UserModels& x) {
        x.user_role = j.at("userRole").get<UserRole>();
        x.user_entity = j.at("userEntity").get<UserEntity>();
    }

}