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
    struct HttpSuccessfulResponse {
        bool success;
        T data;
    };

    struct HttpUnsuccessfulResponse {
        bool success;
        std::string message;
        std::optional<std::unordered_map<std::string, nlohmann::json>> details;
    };

    struct HttpErrorResponse {
        std::string message;
    };

    struct SomeDtoResult {
        std::string id;
        std::string name;
        std::uint64_t age;
    };

    struct InternalObjectWithGeneric : public HttpSuccessfulResponse<SomeDtoResult> {};

    struct ObjectWithGeneric {
        InternalObjectWithGeneric internal;
        HttpSuccessfulResponse<SomeDtoResult> item;
        GENERICS_APP::GenericUserEntity<SomeDtoResult> user_item;
        GENERICS_APP::AdminUserEntity other_user_item;
    };

    struct OtherDtoResult {
        std::string code;
        std::string description;
    };

    struct DataRetrieve : public HttpSuccessfulResponse<SomeDtoResult> {};

    using DiscriminantDataRetrieve = std::variant<
        HttpSuccessfulResponse<SomeDtoResult>,
        HttpUnsuccessfulResponse
    >;

    struct IntersectedDataRetrieve : public HttpSuccessfulResponse<SomeDtoResult>, public GENERICS_APP::GenericUserEntity<OtherDtoResult> {
        // Intersection fields are inherited from base structs.
    };

    struct UserRetrieve : public HttpSuccessfulResponse<GENERICS_APP::NormalUserEntity> {};

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
        j["success"] = x.success;
        j["data"] = x.data;
    }

    template<typename T>
    inline void from_json(const nlohmann::json& j, HttpSuccessfulResponse<T>& x) {
        x.success = j.at("success").get<bool>();
        x.data = j.at("data").get<T>();
    }

    inline void to_json(nlohmann::json& j, const HttpUnsuccessfulResponse& x) {
        j["success"] = x.success;
        j["message"] = x.message;
        GENERICS_INFRA::set_opt<std::unordered_map<std::string, nlohmann::json>>(j, "details", x.details);
    }

    inline void from_json(const nlohmann::json& j, HttpUnsuccessfulResponse& x) {
        x.success = j.at("success").get<bool>();
        x.message = j.at("message").get<std::string>();
        x.details = GENERICS_INFRA::get_opt<std::unordered_map<std::string, nlohmann::json>>(j, "details");
    }

    inline void to_json(nlohmann::json& j, const HttpErrorResponse& x) {
        j["message"] = x.message;
    }

    inline void from_json(const nlohmann::json& j, HttpErrorResponse& x) {
        x.message = j.at("message").get<std::string>();
    }

    inline void to_json(nlohmann::json& j, const SomeDtoResult& x) {
        j["id"] = x.id;
        j["name"] = x.name;
        j["age"] = x.age;
    }

    inline void from_json(const nlohmann::json& j, SomeDtoResult& x) {
        x.id = j.at("id").get<std::string>();
        x.name = j.at("name").get<std::string>();
        x.age = j.at("age").get<std::uint64_t>();
    }

    inline void to_json(nlohmann::json& j, const ObjectWithGeneric& x) {
        j["internal"] = x.internal;
        j["item"] = x.item;
        j["userItem"] = x.user_item;
        j["otherUserItem"] = x.other_user_item;
    }

    inline void from_json(const nlohmann::json& j, ObjectWithGeneric& x) {
        x.internal = j.at("internal").get<InternalObjectWithGeneric>();
        x.item = j.at("item").get<HttpSuccessfulResponse<SomeDtoResult>>();
        x.user_item = j.at("userItem").get<GENERICS_APP::GenericUserEntity<SomeDtoResult>>();
        x.other_user_item = j.at("otherUserItem").get<GENERICS_APP::AdminUserEntity>();
    }

    inline void to_json(nlohmann::json& j, const OtherDtoResult& x) {
        j["code"] = x.code;
        j["description"] = x.description;
    }

    inline void from_json(const nlohmann::json& j, OtherDtoResult& x) {
        x.code = j.at("code").get<std::string>();
        x.description = j.at("description").get<std::string>();
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