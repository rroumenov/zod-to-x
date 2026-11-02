#pragma once

#include <boost/optional.hpp>
#include <cstdint>
#include <nlohmann/json.hpp>
#include <string>
#include <vector>

namespace CASE_7_DOMAIN {
    struct File {
        std::string name;
        std::int64_t size;
    };

    struct Folder {
        std::string name;
        boost::optional<File> main_file;
        boost::optional<File> readme;
        std::vector<File> files;
        boost::optional<std::string> owner;
    };

}

namespace CASE_7_DOMAIN {
    #ifndef NLOHMANN_OPTIONAL_HELPER_CASE_7_DOMAIN
    #define NLOHMANN_OPTIONAL_HELPER_CASE_7_DOMAIN
    template <typename T>
    boost::optional<T> get_opt(const nlohmann::json& j, const std::string& key) {
        auto it = j.find(key);
        if (it != j.end() && !it->is_null()) {
            return it->get<T>();
        }
        return boost::optional<T>();
    }

    template <typename T>
    void set_opt(nlohmann::json& j, const std::string& key, const boost::optional<T>& opt) {
        if (opt) {
            j[key] = *opt;
        }
    }
    #endif

    inline void to_json(nlohmann::json& j, const File& x) {
        j["name"] = x.name;
        j["size"] = x.size;
    }

    inline void from_json(const nlohmann::json& j, File& x) {
        x.name = j.at("name").get<std::string>();
        x.size = j.at("size").get<std::int64_t>();
    }

    inline void to_json(nlohmann::json& j, const Folder& x) {
        j["name"] = x.name;
        CASE_7_DOMAIN::set_opt<File>(j, "mainFile", x.main_file);
        CASE_7_DOMAIN::set_opt<File>(j, "readme", x.readme);
        j["files"] = x.files;
        CASE_7_DOMAIN::set_opt<std::string>(j, "owner", x.owner);
    }

    inline void from_json(const nlohmann::json& j, Folder& x) {
        x.name = j.at("name").get<std::string>();
        x.main_file = CASE_7_DOMAIN::get_opt<File>(j, "mainFile");
        x.readme = CASE_7_DOMAIN::get_opt<File>(j, "readme");
        x.files = j.at("files").get<std::vector<File>>();
        x.owner = CASE_7_DOMAIN::get_opt<std::string>(j, "owner");
    }

}