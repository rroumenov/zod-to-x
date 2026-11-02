#pragma once

#include <nlohmann/json.hpp>
#include <string>
#include <vector>

namespace CASE_11_DOMAIN {
    class UserEntity {
    private:
        std::string id;
        std::string name;
    
    public:
        UserEntity() = default;
        virtual ~UserEntity() = default;
        
        const std::string& get_id() const { return this->id; }
        std::string& get_mut_id() { return this->id; }
        void set_id(const std::string& value) { this->id = value; }
        
        const std::string& get_name() const { return this->name; }
        std::string& get_mut_name() { return this->name; }
        void set_name(const std::string& value) { this->name = value; }
    };

    class Group {
    private:
        UserEntity owner;
        std::vector<UserEntity> members;
    
    public:
        Group() = default;
        virtual ~Group() = default;
        
        const UserEntity& get_owner() const { return this->owner; }
        UserEntity& get_mut_owner() { return this->owner; }
        void set_owner(const UserEntity& value) { this->owner = value; }
        
        const std::vector<UserEntity>& get_members() const { return this->members; }
        std::vector<UserEntity>& get_mut_members() { return this->members; }
        void set_members(const std::vector<UserEntity>& value) { this->members = value; }
    };

}

namespace CASE_11_DOMAIN {
    inline void to_json(nlohmann::json& j, const UserEntity& x) {
        j["id"] = x.get_id();
        j["name"] = x.get_name();
    }

    inline void from_json(const nlohmann::json& j, UserEntity& x) {
        x.set_id(j.at("id").get<std::string>());
        x.set_name(j.at("name").get<std::string>());
    }

    inline void to_json(nlohmann::json& j, const Group& x) {
        j["owner"] = x.get_owner();
        j["members"] = x.get_members();
    }

    inline void from_json(const nlohmann::json& j, Group& x) {
        x.set_owner(j.at("owner").get<UserEntity>());
        x.set_members(j.at("members").get<std::vector<UserEntity>>());
    }

}