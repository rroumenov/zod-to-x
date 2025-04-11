// This is
// a multiline
// header.

#pragma once

#include "user.entity.hpp"
#include <cstdint>
#include <nlohmann/json.hpp>
#include <optional>
#include <string>

using nlohmann::json;

namespace USER_DTOS {
    struct CreateUserUseCaseDto {
        std::string name;
        std::string email;
        std::optional<std::uint64_t> age;
        USER::UserRole role;
    };

    struct CreateUserUseCaseResultDto {
        std::string id;
        std::string name;
        std::string email;
        std::optional<std::uint64_t> age;
        std::string created_at;
        std::string updated_at;
    };

    struct UserDtos {
        CreateUserUseCaseDto create_user_use_case_dto;
        CreateUserUseCaseResultDto create_user_use_case_result_dto;
    };

}

namespace USER_DTOS {
    #ifndef NLOHMANN_OPTIONAL_HELPER_USER_DTOS
    #define NLOHMANN_OPTIONAL_HELPER_USER_DTOS
    template <typename T>
    std::optional<T> get_opt(const json& j, const std::string& key) {
        auto it = j.find(key);
        if (it != j.end() && !it->is_null()) {
            return it->get<T>();
        }
        return std::optional<T>();
    }

    template <typename T>
    void set_opt(json& j, const std::string& key, const std::optional<T>& opt) {
        if (opt) {
            j[key] = *opt;
        }
        else {
            j[key] = nullptr;
        }
    }
    #endif

    inline void to_json(json& j, const CreateUserUseCaseDto& x) {
        j["name"] = x.name;
        j["email"] = x.email;
        set_opt<std::uint64_t>(j, "age", x.age);
        j["role"] = x.role;
    }

    inline void from_json(const json& j, CreateUserUseCaseDto& x) {
        x.name = j.at("name").get<std::string>();
        x.email = j.at("email").get<std::string>();
        x.age = get_opt<std::uint64_t>(j, "age");
        x.role = j.at("role").get<USER::UserRole>();
    }

    inline void to_json(json& j, const CreateUserUseCaseResultDto& x) {
        j["id"] = x.id;
        j["name"] = x.name;
        j["email"] = x.email;
        set_opt<std::uint64_t>(j, "age", x.age);
        j["createdAt"] = x.created_at;
        j["updatedAt"] = x.updated_at;
    }

    inline void from_json(const json& j, CreateUserUseCaseResultDto& x) {
        x.id = j.at("id").get<std::string>();
        x.name = j.at("name").get<std::string>();
        x.email = j.at("email").get<std::string>();
        x.age = get_opt<std::uint64_t>(j, "age");
        x.created_at = j.at("createdAt").get<std::string>();
        x.updated_at = j.at("updatedAt").get<std::string>();
    }

    inline void to_json(json& j, const UserDtos& x) {
        j["createUserUseCaseDto"] = x.create_user_use_case_dto;
        j["createUserUseCaseResultDto"] = x.create_user_use_case_result_dto;
    }

    inline void from_json(const json& j, UserDtos& x) {
        x.create_user_use_case_dto = j.at("createUserUseCaseDto").get<CreateUserUseCaseDto>();
        x.create_user_use_case_result_dto = j.at("createUserUseCaseResultDto").get<CreateUserUseCaseResultDto>();
    }

}