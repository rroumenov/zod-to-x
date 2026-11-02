#pragma once

#include <boost/optional.hpp>
#include <cstdint>
#include <nlohmann/json.hpp>
#include <string>
#include <vector>

namespace CASE_7_DOMAIN {
    class File {
    private:
        std::string name;
        std::int64_t size;
    
    public:
        File() = default;
        virtual ~File() = default;
        
        const std::string& get_name() const { return this->name; }
        std::string& get_mut_name() { return this->name; }
        void set_name(const std::string& value) { this->name = value; }
        
        const std::int64_t& get_size() const { return this->size; }
        std::int64_t& get_mut_size() { return this->size; }
        void set_size(const std::int64_t& value) { this->size = value; }
    };

    class Folder {
    private:
        std::string name;
        boost::optional<File> main_file;
        boost::optional<File> readme;
        std::vector<File> files;
        boost::optional<std::string> owner;
    
    public:
        Folder() = default;
        virtual ~Folder() = default;
        
        const std::string& get_name() const { return this->name; }
        std::string& get_mut_name() { return this->name; }
        void set_name(const std::string& value) { this->name = value; }
        
        boost::optional<File> get_main_file() const { return this->main_file; }
        void set_main_file(boost::optional<File> value) { this->main_file = value; }
        
        boost::optional<File> get_readme() const { return this->readme; }
        void set_readme(boost::optional<File> value) { this->readme = value; }
        
        const std::vector<File>& get_files() const { return this->files; }
        std::vector<File>& get_mut_files() { return this->files; }
        void set_files(const std::vector<File>& value) { this->files = value; }
        
        boost::optional<std::string> get_owner() const { return this->owner; }
        void set_owner(boost::optional<std::string> value) { this->owner = value; }
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
        j["name"] = x.get_name();
        j["size"] = x.get_size();
    }

    inline void from_json(const nlohmann::json& j, File& x) {
        x.set_name(j.at("name").get<std::string>());
        x.set_size(j.at("size").get<std::int64_t>());
    }

    inline void to_json(nlohmann::json& j, const Folder& x) {
        j["name"] = x.get_name();
        CASE_7_DOMAIN::set_opt<File>(j, "mainFile", x.get_main_file());
        CASE_7_DOMAIN::set_opt<File>(j, "readme", x.get_readme());
        j["files"] = x.get_files();
        CASE_7_DOMAIN::set_opt<std::string>(j, "owner", x.get_owner());
    }

    inline void from_json(const nlohmann::json& j, Folder& x) {
        x.set_name(j.at("name").get<std::string>());
        x.set_main_file(CASE_7_DOMAIN::get_opt<File>(j, "mainFile"));
        x.set_readme(CASE_7_DOMAIN::get_opt<File>(j, "readme"));
        x.set_files(j.at("files").get<std::vector<File>>());
        x.set_owner(CASE_7_DOMAIN::get_opt<std::string>(j, "owner"));
    }

}