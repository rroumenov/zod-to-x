// This is
// a multiline
// header.

#pragma once

#include <cstdint>
#include <nlohmann/json.hpp>
#include <optional>
#include <stdexcept>
#include <string>
#include <unordered_map>
#include <variant>
#include <vector>

namespace GENERICS_APP {
    // GenericUserEntity
    template<typename T>
    class GenericUserEntity {
    private:
        std::string id;
        std::string name;
        std::string email;
        std::optional<std::uint64_t> age;
        T metadata;
    
    public:
        GenericUserEntity() = default;
        virtual ~GenericUserEntity() = default;
        
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
        
        const T& get_metadata() const { return this->metadata; }
        T& get_mut_metadata() { return this->metadata; }
        void set_metadata(const T& value) { this->metadata = value; }
    };

    // NormalUserMetadata
    class NormalUserMetadata {
    private:
        std::string favorite_color;
        std::vector<std::string> hobbies;
    
    public:
        NormalUserMetadata() = default;
        virtual ~NormalUserMetadata() = default;
        
        const std::string& get_favorite_color() const { return this->favorite_color; }
        std::string& get_mut_favorite_color() { return this->favorite_color; }
        void set_favorite_color(const std::string& value) { this->favorite_color = value; }
        
        const std::vector<std::string>& get_hobbies() const { return this->hobbies; }
        std::vector<std::string>& get_mut_hobbies() { return this->hobbies; }
        void set_hobbies(const std::vector<std::string>& value) { this->hobbies = value; }
    };

    class NormalUserEntity : public GenericUserEntity<NormalUserMetadata> {};

    // AdminUserMetadata
    class AdminUserMetadata {
    private:
        std::uint64_t admin_level;
        std::vector<std::string> permissions;
    
    public:
        AdminUserMetadata() = default;
        virtual ~AdminUserMetadata() = default;
        
        const std::uint64_t& get_admin_level() const { return this->admin_level; }
        std::uint64_t& get_mut_admin_level() { return this->admin_level; }
        void set_admin_level(const std::uint64_t& value) { this->admin_level = value; }
        
        const std::vector<std::string>& get_permissions() const { return this->permissions; }
        std::vector<std::string>& get_mut_permissions() { return this->permissions; }
        void set_permissions(const std::vector<std::string>& value) { this->permissions = value; }
    };

    class AdminUserEntity : public GenericUserEntity<AdminUserMetadata> {};

    using RecordStringAny = std::unordered_map<std::string, nlohmann::json>;

    // UserEntities
    using UserEntities = std::variant<
        NormalUserEntity,
        AdminUserEntity,
        GenericUserEntity<RecordStringAny>
    >;

}

namespace GENERICS_APP {
    #ifndef NLOHMANN_OPTIONAL_HELPER_GENERICS_APP
    #define NLOHMANN_OPTIONAL_HELPER_GENERICS_APP
    template <typename T>
    std::optional<T> get_opt(const nlohmann::json& j, const std::string& key) {
        auto it = j.find(key);
        if (it != j.end() && !it->is_null()) {
            return it->get<T>();
        }
        return std::optional<T>();
    }

    template <typename T>
    void set_opt(nlohmann::json& j, const std::string& key, const std::optional<T>& opt) {
        if (opt) {
            j[key] = *opt;
        }
    }
    #endif

    template<typename T>
    inline void to_json(nlohmann::json& j, const GenericUserEntity<T>& x) {
        j["id"] = x.get_id();
        j["name"] = x.get_name();
        j["email"] = x.get_email();
        GENERICS_APP::set_opt<std::uint64_t>(j, "age", x.get_age());
        j["metadata"] = x.get_metadata();
    }

    template<typename T>
    inline void from_json(const nlohmann::json& j, GenericUserEntity<T>& x) {
        x.set_id(j.at("id").get<std::string>());
        x.set_name(j.at("name").get<std::string>());
        x.set_email(j.at("email").get<std::string>());
        x.set_age(GENERICS_APP::get_opt<std::uint64_t>(j, "age"));
        x.set_metadata(j.at("metadata").get<T>());
    }

    inline void to_json(nlohmann::json& j, const NormalUserMetadata& x) {
        j["favoriteColor"] = x.get_favorite_color();
        j["hobbies"] = x.get_hobbies();
    }

    inline void from_json(const nlohmann::json& j, NormalUserMetadata& x) {
        x.set_favorite_color(j.at("favoriteColor").get<std::string>());
        x.set_hobbies(j.at("hobbies").get<std::vector<std::string>>());
    }

    inline void to_json(nlohmann::json& j, const AdminUserMetadata& x) {
        j["adminLevel"] = x.get_admin_level();
        j["permissions"] = x.get_permissions();
    }

    inline void from_json(const nlohmann::json& j, AdminUserMetadata& x) {
        x.set_admin_level(j.at("adminLevel").get<std::uint64_t>());
        x.set_permissions(j.at("permissions").get<std::vector<std::string>>());
    }

    inline void to_json(nlohmann::json& j, const UserEntities& x) {
        std::visit(
            [&j](auto&& arg) {
                using T = std::decay_t<decltype(arg)>;
                if constexpr (std::is_same_v<T, NormalUserEntity>) {
                    j = arg;
                }
                else if constexpr (std::is_same_v<T, AdminUserEntity>) {
                    j = arg;
                }
                else if constexpr (std::is_same_v<T, GenericUserEntity<RecordStringAny>>) {
                    j = arg;
                }
                else {
                    throw std::runtime_error("Unknown UserEntities type.");
                }
            },
            x
        );
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