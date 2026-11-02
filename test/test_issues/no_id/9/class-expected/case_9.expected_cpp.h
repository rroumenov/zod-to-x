#pragma once

#include "case_9_domain.hpp"
#include <nlohmann/json.hpp>
#include <string>

namespace CASE_9_APP {
    class Wrapper {
    private:
        CASE_9_DOMAIN::User domain_user;
    
    public:
        Wrapper() = default;
        virtual ~Wrapper() = default;
        
        const CASE_9_DOMAIN::User& get_domain_user() const { return this->domain_user; }
        CASE_9_DOMAIN::User& get_mut_domain_user() { return this->domain_user; }
        void set_domain_user(const CASE_9_DOMAIN::User& value) { this->domain_user = value; }
    };

    class User {
    private:
        std::string name;
        bool is_admin;
    
    public:
        User() = default;
        virtual ~User() = default;
        
        const std::string& get_name() const { return this->name; }
        std::string& get_mut_name() { return this->name; }
        void set_name(const std::string& value) { this->name = value; }
        
        const bool& get_is_admin() const { return this->is_admin; }
        bool& get_mut_is_admin() { return this->is_admin; }
        void set_is_admin(const bool& value) { this->is_admin = value; }
    };

}

namespace CASE_9_APP {
    inline void to_json(nlohmann::json& j, const Wrapper& x) {
        j["domainUser"] = x.get_domain_user();
    }

    inline void from_json(const nlohmann::json& j, Wrapper& x) {
        x.set_domain_user(j.at("domainUser").get<CASE_9_DOMAIN::User>());
    }

    inline void to_json(nlohmann::json& j, const User& x) {
        j["name"] = x.get_name();
        j["isAdmin"] = x.get_is_admin();
    }

    inline void from_json(const nlohmann::json& j, User& x) {
        x.set_name(j.at("name").get<std::string>());
        x.set_is_admin(j.at("isAdmin").get<bool>());
    }

}