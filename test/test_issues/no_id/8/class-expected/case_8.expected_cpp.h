#pragma once

#include <cstdint>
#include <nlohmann/json.hpp>
#include <string>
#include <vector>

namespace CASE_8_DOMAIN {
    class Settings {
    private:
        std::string name;
        std::int64_t retries;
        bool enabled;
        std::vector<std::string> tags;
        std::string nickname;
        std::int64_t port;
        std::string title;
        nlohmann::json extra;
    
    public:
        Settings() = default;
        virtual ~Settings() = default;
        
        const std::string& get_name() const { return this->name; }
        std::string& get_mut_name() { return this->name; }
        void set_name(const std::string& value) { this->name = value; }
        
        const std::int64_t& get_retries() const { return this->retries; }
        std::int64_t& get_mut_retries() { return this->retries; }
        void set_retries(const std::int64_t& value) { this->retries = value; }
        
        const bool& get_enabled() const { return this->enabled; }
        bool& get_mut_enabled() { return this->enabled; }
        void set_enabled(const bool& value) { this->enabled = value; }
        
        const std::vector<std::string>& get_tags() const { return this->tags; }
        std::vector<std::string>& get_mut_tags() { return this->tags; }
        void set_tags(const std::vector<std::string>& value) { this->tags = value; }
        
        const std::string& get_nickname() const { return this->nickname; }
        std::string& get_mut_nickname() { return this->nickname; }
        void set_nickname(const std::string& value) { this->nickname = value; }
        
        const std::int64_t& get_port() const { return this->port; }
        std::int64_t& get_mut_port() { return this->port; }
        void set_port(const std::int64_t& value) { this->port = value; }
        
        const std::string& get_title() const { return this->title; }
        std::string& get_mut_title() { return this->title; }
        void set_title(const std::string& value) { this->title = value; }
        
        const nlohmann::json& get_extra() const { return this->extra; }
        nlohmann::json& get_mut_extra() { return this->extra; }
        void set_extra(const nlohmann::json& value) { this->extra = value; }
    };

}

namespace CASE_8_DOMAIN {
    inline void to_json(nlohmann::json& j, const Settings& x) {
        j["name"] = x.get_name();
        j["retries"] = x.get_retries();
        j["enabled"] = x.get_enabled();
        j["tags"] = x.get_tags();
        j["nickname"] = x.get_nickname();
        j["port"] = x.get_port();
        j["title"] = x.get_title();
        j["extra"] = x.get_extra();
    }

    inline void from_json(const nlohmann::json& j, Settings& x) {
        x.set_name(j.at("name").get<std::string>());
        x.set_retries(j.at("retries").get<std::int64_t>());
        x.set_enabled(j.at("enabled").get<bool>());
        x.set_tags(j.at("tags").get<std::vector<std::string>>());
        x.set_nickname(j.at("nickname").get<std::string>());
        x.set_port(j.at("port").get<std::int64_t>());
        x.set_title(j.at("title").get<std::string>());
        x.set_extra(j.at("extra").get<nlohmann::json>());
    }

}