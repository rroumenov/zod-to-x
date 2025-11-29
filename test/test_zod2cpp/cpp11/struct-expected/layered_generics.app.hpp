// This is
// a multiline
// header.

#pragma once

#include <boost/optional.hpp>
#include <boost/variant.hpp>
#include <cstdint>
#include <nlohmann/json.hpp>
#include <stdexcept>
#include <string>
#include <unordered_map>
#include <vector>

namespace GENERICS_APP {
    // GenericUserEntity
    template<typename T>
    struct GenericUserEntity {
        std::string id;
        std::string name;
        std::string email;
        boost::optional<std::uint64_t> age;
        T metadata;
    };

    // NormalUserMetadata
    struct NormalUserMetadata {
        std::string favorite_color;
        std::vector<std::string> hobbies;
    };

    struct NormalUserEntity : public GenericUserEntity<NormalUserMetadata> {};

    // AdminUserMetadata
    struct AdminUserMetadata {
        std::uint64_t admin_level;
        std::vector<std::string> permissions;
    };

    struct AdminUserEntity : public GenericUserEntity<AdminUserMetadata> {};

    using RecordStringAny = std::unordered_map<std::string, nlohmann::json>;

    // UserEntities
    using UserEntities = boost::variant<
        NormalUserEntity,
        AdminUserEntity,
        GenericUserEntity<RecordStringAny>
    >;

}

namespace GENERICS_APP {
    #ifndef NLOHMANN_OPTIONAL_HELPER_GENERICS_APP
    #define NLOHMANN_OPTIONAL_HELPER_GENERICS_APP
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

    template<typename T>
    inline void to_json(nlohmann::json& j, const GenericUserEntity<T>& x) {
        j["id"] = x.id;
        j["name"] = x.name;
        j["email"] = x.email;
        GENERICS_APP::set_opt<std::uint64_t>(j, "age", x.age);
        j["metadata"] = x.metadata;
    }

    template<typename T>
    inline void from_json(const nlohmann::json& j, GenericUserEntity<T>& x) {
        x.id = j.at("id").get<std::string>();
        x.name = j.at("name").get<std::string>();
        x.email = j.at("email").get<std::string>();
        x.age = GENERICS_APP::get_opt<std::uint64_t>(j, "age");
        x.metadata = j.at("metadata").get<T>();
    }

    inline void to_json(nlohmann::json& j, const NormalUserMetadata& x) {
        j["favoriteColor"] = x.favorite_color;
        j["hobbies"] = x.hobbies;
    }

    inline void from_json(const nlohmann::json& j, NormalUserMetadata& x) {
        x.favorite_color = j.at("favoriteColor").get<std::string>();
        x.hobbies = j.at("hobbies").get<std::vector<std::string>>();
    }

    inline void to_json(nlohmann::json& j, const AdminUserMetadata& x) {
        j["adminLevel"] = x.admin_level;
        j["permissions"] = x.permissions;
    }

    inline void from_json(const nlohmann::json& j, AdminUserMetadata& x) {
        x.admin_level = j.at("adminLevel").get<std::uint64_t>();
        x.permissions = j.at("permissions").get<std::vector<std::string>>();
    }

    inline void to_json(nlohmann::json& j, const UserEntities& x) {
        if (x.type() == typeid(NormalUserEntity)) {
            j = boost::get<NormalUserEntity>(x);
        }
        else if (x.type() == typeid(AdminUserEntity)) {
            j = boost::get<AdminUserEntity>(x);
        }
        else if (x.type() == typeid(GenericUserEntity<RecordStringAny>)) {
            j = boost::get<GenericUserEntity<RecordStringAny>>(x);
        }
        else {
            throw std::runtime_error("Unknown UserEntities type.");
        }
    }

    inline void from_json(const nlohmann::json& j, UserEntities& x) {
        try {
            // Try to deserialize as NormalUserEntity
            x = j.get<NormalUserEntity>();
            return;
        } catch (const std::exception&) {
            // Fall through to try the next type
        }
        try {
            // Try to deserialize as AdminUserEntity
            x = j.get<AdminUserEntity>();
            return;
        } catch (const std::exception&) {
            // Fall through to try the next type
        }
        try {
            // Try to deserialize as GenericUserEntity<RecordStringAny>
            x = j.get<GenericUserEntity<RecordStringAny>>();
            return;
        } catch (const std::exception&) {
            // None of the types matched. Error
            throw std::runtime_error("Failed to deserialize UserEntities: unknown format");
        }
    }

}