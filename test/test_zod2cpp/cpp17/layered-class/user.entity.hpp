// This is
// a multiline
// header.
#pragma once

#include <stdexcept>
#include <string>
#include <cstdint>
#include <boost/optional.hpp>
#include <nlohmann/json.hpp>

using nlohmann::json;

namespace USER {
    enum class UserRole: int {
        Admin,
        User
    };

    class UserEntity {
    private:
        std::string id;
        std::string name;
        std::string email;
        boost::optional<std::uint64_t> age;
        UserRole role;
    
    public:
        UserEntity() = default;
        virtual ~UserEntity() = default;
        
        const std::string& get_id() const { return this->id; }
        std::string& get_mut_id() { return this->id; }
        void set_id(const std::string& value) { this->id = value; }
        
        const std::string& get_name() const { return this->name; }
        std::string& get_mut_name() { return this->name; }
        void set_name(const std::string& value) { this->name = value; }
        
        const std::string& get_email() const { return this->email; }
        std::string& get_mut_email() { return this->email; }
        void set_email(const std::string& value) { this->email = value; }
        
        boost::optional<std::uint64_t> get_age() const { return this->age; }
        void set_age(boost::optional<std::uint64_t> value) { this->age = value; }
        
        const UserRole& get_role() const { return this->role; }
        UserRole& get_mut_role() { return this->role; }
        void set_role(const UserRole& value) { this->role = value; }
    };

    class UserModels {
    private:
        UserRole user_role;
        UserEntity user_entity;
    
    public:
        UserModels() = default;
        virtual ~UserModels() = default;
        
        const UserRole& get_user_role() const { return this->user_role; }
        UserRole& get_mut_user_role() { return this->user_role; }
        void set_user_role(const UserRole& value) { this->user_role = value; }
        
        const UserEntity& get_user_entity() const { return this->user_entity; }
        UserEntity& get_mut_user_entity() { return this->user_entity; }
        void set_user_entity(const UserEntity& value) { this->user_entity = value; }
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
        j["id"] = x.get_id();
        j["name"] = x.get_name();
        j["email"] = x.get_email();
        set_opt<std::uint64_t>(j, "age", x.get_age());
        j["role"] = x.get_role();
    }

    inline void from_json(const json& j, UserEntity& x) {
        x.set_id(j.at("id").get<std::string>());
        x.set_name(j.at("name").get<std::string>());
        x.set_email(j.at("email").get<std::string>());
        x.set_age(get_opt<std::uint64_t>(j, "age"));
        x.set_role(j.at("role").get<UserRole>());
    }

    inline void to_json(json& j, const UserModels& x) {
        j["userRole"] = x.get_user_role();
        j["userEntity"] = x.get_user_entity();
    }

    inline void from_json(const json& j, UserModels& x) {
        x.set_user_role(j.at("userRole").get<UserRole>());
        x.set_user_entity(j.at("userEntity").get<UserEntity>());
    }

}