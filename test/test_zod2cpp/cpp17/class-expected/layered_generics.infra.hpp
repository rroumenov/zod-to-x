// This is
// a multiline
// header.

#pragma once

#include "layered_generics.app.hpp"
#include <cstdint>
#include <nlohmann/json.hpp>
#include <optional>
#include <stdexcept>
#include <string>
#include <unordered_map>
#include <variant>

namespace GENERICS_INFRA {
    template<typename T>
    class HttpSuccessfulResponse {
    private:
        bool success;
        T data;
    
    public:
        HttpSuccessfulResponse() = default;
        virtual ~HttpSuccessfulResponse() = default;
        
        const bool& get_success() const { return this->success; }
        bool& get_mut_success() { return this->success; }
        void set_success(const bool& value) { this->success = value; }
        
        const T& get_data() const { return this->data; }
        T& get_mut_data() { return this->data; }
        void set_data(const T& value) { this->data = value; }
    };

    class HttpUnsuccessfulResponse {
    private:
        bool success;
        std::string message;
        std::optional<std::unordered_map<std::string, nlohmann::json>> details;
    
    public:
        HttpUnsuccessfulResponse() = default;
        virtual ~HttpUnsuccessfulResponse() = default;
        
        const bool& get_success() const { return this->success; }
        bool& get_mut_success() { return this->success; }
        void set_success(const bool& value) { this->success = value; }
        
        const std::string& get_message() const { return this->message; }
        std::string& get_mut_message() { return this->message; }
        void set_message(const std::string& value) { this->message = value; }
        
        std::optional<std::unordered_map<std::string, nlohmann::json>> get_details() const { return this->details; }
        void set_details(std::optional<std::unordered_map<std::string, nlohmann::json>> value) { this->details = value; }
    };

    class HttpErrorResponse {
    private:
        std::string message;
    
    public:
        HttpErrorResponse() = default;
        virtual ~HttpErrorResponse() = default;
        
        const std::string& get_message() const { return this->message; }
        std::string& get_mut_message() { return this->message; }
        void set_message(const std::string& value) { this->message = value; }
    };

    class SomeDtoResult {
    private:
        std::string id;
        std::string name;
        std::uint64_t age;
    
    public:
        SomeDtoResult() = default;
        virtual ~SomeDtoResult() = default;
        
        const std::string& get_id() const { return this->id; }
        std::string& get_mut_id() { return this->id; }
        void set_id(const std::string& value) { this->id = value; }
        
        const std::string& get_name() const { return this->name; }
        std::string& get_mut_name() { return this->name; }
        void set_name(const std::string& value) { this->name = value; }
        
        const std::uint64_t& get_age() const { return this->age; }
        std::uint64_t& get_mut_age() { return this->age; }
        void set_age(const std::uint64_t& value) { this->age = value; }
    };

    class InternalObjectWithGeneric : public HttpSuccessfulResponse<SomeDtoResult> {};

    class ObjectWithGeneric {
    private:
        InternalObjectWithGeneric internal;
        HttpSuccessfulResponse<SomeDtoResult> item;
        GENERICS_APP::GenericUserEntity<SomeDtoResult> user_item;
        GENERICS_APP::AdminUserEntity other_user_item;
    
    public:
        ObjectWithGeneric() = default;
        virtual ~ObjectWithGeneric() = default;
        
        const InternalObjectWithGeneric& get_internal() const { return this->internal; }
        InternalObjectWithGeneric& get_mut_internal() { return this->internal; }
        void set_internal(const InternalObjectWithGeneric& value) { this->internal = value; }
        
        const HttpSuccessfulResponse<SomeDtoResult>& get_item() const { return this->item; }
        HttpSuccessfulResponse<SomeDtoResult>& get_mut_item() { return this->item; }
        void set_item(const HttpSuccessfulResponse<SomeDtoResult>& value) { this->item = value; }
        
        const GENERICS_APP::GenericUserEntity<SomeDtoResult>& get_user_item() const { return this->user_item; }
        GENERICS_APP::GenericUserEntity<SomeDtoResult>& get_mut_user_item() { return this->user_item; }
        void set_user_item(const GENERICS_APP::GenericUserEntity<SomeDtoResult>& value) { this->user_item = value; }
        
        const GENERICS_APP::AdminUserEntity& get_other_user_item() const { return this->other_user_item; }
        GENERICS_APP::AdminUserEntity& get_mut_other_user_item() { return this->other_user_item; }
        void set_other_user_item(const GENERICS_APP::AdminUserEntity& value) { this->other_user_item = value; }
    };

    class OtherDtoResult {
    private:
        std::string code;
        std::string description;
    
    public:
        OtherDtoResult() = default;
        virtual ~OtherDtoResult() = default;
        
        const std::string& get_code() const { return this->code; }
        std::string& get_mut_code() { return this->code; }
        void set_code(const std::string& value) { this->code = value; }
        
        const std::string& get_description() const { return this->description; }
        std::string& get_mut_description() { return this->description; }
        void set_description(const std::string& value) { this->description = value; }
    };

    class DataRetrieve : public HttpSuccessfulResponse<SomeDtoResult> {};

    using DiscriminantDataRetrieve = std::variant<
        HttpSuccessfulResponse<SomeDtoResult>,
        HttpUnsuccessfulResponse
    >;

    class IntersectedDataRetrieve : public HttpSuccessfulResponse<SomeDtoResult>, public GENERICS_APP::GenericUserEntity<OtherDtoResult> {
    public:
        IntersectedDataRetrieve() = default;
        virtual ~IntersectedDataRetrieve() = default;
    
        // Intersection fields are inherited from base classes.
    };

    class UserRetrieve : public HttpSuccessfulResponse<GENERICS_APP::NormalUserEntity> {};

}

namespace GENERICS_INFRA {
    #ifndef NLOHMANN_OPTIONAL_HELPER_GENERICS_INFRA
    #define NLOHMANN_OPTIONAL_HELPER_GENERICS_INFRA
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
    inline void to_json(nlohmann::json& j, const HttpSuccessfulResponse<T>& x) {
        j["success"] = x.get_success();
        j["data"] = x.get_data();
    }

    template<typename T>
    inline void from_json(const nlohmann::json& j, HttpSuccessfulResponse<T>& x) {
        x.set_success(j.at("success").get<bool>());
        x.set_data(j.at("data").get<T>());
    }

    inline void to_json(nlohmann::json& j, const HttpUnsuccessfulResponse& x) {
        j["success"] = x.get_success();
        j["message"] = x.get_message();
        GENERICS_INFRA::set_opt<std::unordered_map<std::string, nlohmann::json>>(j, "details", x.get_details());
    }

    inline void from_json(const nlohmann::json& j, HttpUnsuccessfulResponse& x) {
        x.set_success(j.at("success").get<bool>());
        x.set_message(j.at("message").get<std::string>());
        x.set_details(GENERICS_INFRA::get_opt<std::unordered_map<std::string, nlohmann::json>>(j, "details"));
    }

    inline void to_json(nlohmann::json& j, const HttpErrorResponse& x) {
        j["message"] = x.get_message();
    }

    inline void from_json(const nlohmann::json& j, HttpErrorResponse& x) {
        x.set_message(j.at("message").get<std::string>());
    }

    inline void to_json(nlohmann::json& j, const SomeDtoResult& x) {
        j["id"] = x.get_id();
        j["name"] = x.get_name();
        j["age"] = x.get_age();
    }

    inline void from_json(const nlohmann::json& j, SomeDtoResult& x) {
        x.set_id(j.at("id").get<std::string>());
        x.set_name(j.at("name").get<std::string>());
        x.set_age(j.at("age").get<std::uint64_t>());
    }

    inline void to_json(nlohmann::json& j, const ObjectWithGeneric& x) {
        j["internal"] = x.get_internal();
        j["item"] = x.get_item();
        j["userItem"] = x.get_user_item();
        j["otherUserItem"] = x.get_other_user_item();
    }

    inline void from_json(const nlohmann::json& j, ObjectWithGeneric& x) {
        x.set_internal(j.at("internal").get<InternalObjectWithGeneric>());
        x.set_item(j.at("item").get<HttpSuccessfulResponse<SomeDtoResult>>());
        x.set_user_item(j.at("userItem").get<GENERICS_APP::GenericUserEntity<SomeDtoResult>>());
        x.set_other_user_item(j.at("otherUserItem").get<GENERICS_APP::AdminUserEntity>());
    }

    inline void to_json(nlohmann::json& j, const OtherDtoResult& x) {
        j["code"] = x.get_code();
        j["description"] = x.get_description();
    }

    inline void from_json(const nlohmann::json& j, OtherDtoResult& x) {
        x.set_code(j.at("code").get<std::string>());
        x.set_description(j.at("description").get<std::string>());
    }

    inline void to_json(nlohmann::json& j, const DiscriminantDataRetrieve& x) {
        std::visit(
            [&j](auto&& arg) {
                using T = std::decay_t<decltype(arg)>;
                if constexpr (std::is_same_v<T, HttpSuccessfulResponse<SomeDtoResult>>) {
                    j = arg;
                }
                else if constexpr (std::is_same_v<T, HttpUnsuccessfulResponse>) {
                    j = arg;
                }
                else {
                    throw std::runtime_error("Unknown DiscriminantDataRetrieve type.");
                }
            },
            x
        );
    }

    inline void from_json(const nlohmann::json& j, DiscriminantDataRetrieve& x) {
        const auto& k = j.at("success").get<std::string>();
        if (k == "true") {
            x = j.get<HttpSuccessfulResponse<SomeDtoResult>>();
        }
        else if (k == "false") {
            x = j.get<HttpUnsuccessfulResponse>();
        }
        else {
            // None of the types matched. Error
            throw std::runtime_error("Failed to deserialize DiscriminantDataRetrieve: unknown format");
        }
    }

    inline void to_json(nlohmann::json& j, const IntersectedDataRetrieve& x) {
        to_json(j, static_cast<const HttpSuccessfulResponse<SomeDtoResult>&>(x));
        to_json(j, static_cast<const GENERICS_APP::GenericUserEntity<OtherDtoResult>&>(x));
    }

    inline void from_json(const nlohmann::json& j, IntersectedDataRetrieve& x) {
        from_json(j, static_cast<HttpSuccessfulResponse<SomeDtoResult>&>(x));
        from_json(j, static_cast<GENERICS_APP::GenericUserEntity<OtherDtoResult>&>(x));
    }

}