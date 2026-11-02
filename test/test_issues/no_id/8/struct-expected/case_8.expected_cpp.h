#pragma once

#include <cstdint>
#include <nlohmann/json.hpp>
#include <string>
#include <vector>

namespace CASE_8_DOMAIN {
    struct Settings {
        std::string name;
        std::int64_t retries;
        bool enabled;
        std::vector<std::string> tags;
        std::string nickname;
        std::int64_t port;
        std::string title;
        nlohmann::json extra;
    };

}

namespace CASE_8_DOMAIN {
    inline void to_json(nlohmann::json& j, const Settings& x) {
        j["name"] = x.name;
        j["retries"] = x.retries;
        j["enabled"] = x.enabled;
        j["tags"] = x.tags;
        j["nickname"] = x.nickname;
        j["port"] = x.port;
        j["title"] = x.title;
        j["extra"] = x.extra;
    }

    inline void from_json(const nlohmann::json& j, Settings& x) {
        x.name = j.at("name").get<std::string>();
        x.retries = j.at("retries").get<std::int64_t>();
        x.enabled = j.at("enabled").get<bool>();
        x.tags = j.at("tags").get<std::vector<std::string>>();
        x.nickname = j.at("nickname").get<std::string>();
        x.port = j.at("port").get<std::int64_t>();
        x.title = j.at("title").get<std::string>();
        x.extra = j.at("extra").get<nlohmann::json>();
    }

}