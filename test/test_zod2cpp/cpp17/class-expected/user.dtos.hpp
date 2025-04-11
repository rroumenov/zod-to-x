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
    class CreateUserUseCaseDto {
    private:
        std::string name;
        std::string email;
        std::optional<std::uint64_t> age;
        USER::UserRole role;
    
    public:
        CreateUserUseCaseDto() = default;
        virtual ~CreateUserUseCaseDto() = default;
        
        const std::string& get_name() const { return this->name; }
        std::string& get_mut_name() { return this->name; }
        void set_name(const std::string& value) { this->name = value; }
        
        const std::string& get_email() const { return this->email; }
        std::string& get_mut_email() { return this->email; }
        void set_email(const std::string& value) { this->email = value; }
        
        std::optional<std::uint64_t> get_age() const { return this->age; }
        void set_age(std::optional<std::uint64_t> value) { this->age = value; }
        
        const USER::UserRole& get_role() const { return this->role; }
        USER::UserRole& get_mut_role() { return this->role; }
        void set_role(const USER::UserRole& value) { this->role = value; }
    };

    class CreateUserUseCaseResultDto {
    private:
        std::string id;
        std::string name;
        std::string email;
        std::optional<std::uint64_t> age;
        std::string created_at;
        std::string updated_at;
    
    public:
        CreateUserUseCaseResultDto() = default;
        virtual ~CreateUserUseCaseResultDto() = default;
        
        const std::string& get_id() const { return this->id; }
        std::string& get_mut_id() { return this->id; }
        void set_id(const std::string& value) { this->id = value; }
        
        const std::string& get_name() const { return this->name; }
        std::string& get_mut_name() { return this->name; }
        void set_name(const std::string& value) { this->name = value; }
        
        const std::string& get_email() const { return this->email; }
        std::string& get_mut_email() { return this->email; }
        void set_email(const std::string& value) { this->email = value; }
        
        std::optional<std::uint64_t> get_age() const { return this->age; }
        void set_age(std::optional<std::uint64_t> value) { this->age = value; }
        
        const std::string& get_created_at() const { return this->created_at; }
        std::string& get_mut_created_at() { return this->created_at; }
        void set_created_at(const std::string& value) { this->created_at = value; }
        
        const std::string& get_updated_at() const { return this->updated_at; }
        std::string& get_mut_updated_at() { return this->updated_at; }
        void set_updated_at(const std::string& value) { this->updated_at = value; }
    };

    class UserDtos {
    private:
        CreateUserUseCaseDto create_user_use_case_dto;
        CreateUserUseCaseResultDto create_user_use_case_result_dto;
    
    public:
        UserDtos() = default;
        virtual ~UserDtos() = default;
        
        const CreateUserUseCaseDto& get_create_user_use_case_dto() const { return this->create_user_use_case_dto; }
        CreateUserUseCaseDto& get_mut_create_user_use_case_dto() { return this->create_user_use_case_dto; }
        void set_create_user_use_case_dto(const CreateUserUseCaseDto& value) { this->create_user_use_case_dto = value; }
        
        const CreateUserUseCaseResultDto& get_create_user_use_case_result_dto() const { return this->create_user_use_case_result_dto; }
        CreateUserUseCaseResultDto& get_mut_create_user_use_case_result_dto() { return this->create_user_use_case_result_dto; }
        void set_create_user_use_case_result_dto(const CreateUserUseCaseResultDto& value) { this->create_user_use_case_result_dto = value; }
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
        j["name"] = x.get_name();
        j["email"] = x.get_email();
        set_opt<std::uint64_t>(j, "age", x.get_age());
        j["role"] = x.get_role();
    }

    inline void from_json(const json& j, CreateUserUseCaseDto& x) {
        x.set_name(j.at("name").get<std::string>());
        x.set_email(j.at("email").get<std::string>());
        x.set_age(get_opt<std::uint64_t>(j, "age"));
        x.set_role(j.at("role").get<USER::UserRole>());
    }

    inline void to_json(json& j, const CreateUserUseCaseResultDto& x) {
        j["id"] = x.get_id();
        j["name"] = x.get_name();
        j["email"] = x.get_email();
        set_opt<std::uint64_t>(j, "age", x.get_age());
        j["createdAt"] = x.get_created_at();
        j["updatedAt"] = x.get_updated_at();
    }

    inline void from_json(const json& j, CreateUserUseCaseResultDto& x) {
        x.set_id(j.at("id").get<std::string>());
        x.set_name(j.at("name").get<std::string>());
        x.set_email(j.at("email").get<std::string>());
        x.set_age(get_opt<std::uint64_t>(j, "age"));
        x.set_created_at(j.at("createdAt").get<std::string>());
        x.set_updated_at(j.at("updatedAt").get<std::string>());
    }

    inline void to_json(json& j, const UserDtos& x) {
        j["createUserUseCaseDto"] = x.get_create_user_use_case_dto();
        j["createUserUseCaseResultDto"] = x.get_create_user_use_case_result_dto();
    }

    inline void from_json(const json& j, UserDtos& x) {
        x.set_create_user_use_case_dto(j.at("createUserUseCaseDto").get<CreateUserUseCaseDto>());
        x.set_create_user_use_case_result_dto(j.at("createUserUseCaseResultDto").get<CreateUserUseCaseResultDto>());
    }

}