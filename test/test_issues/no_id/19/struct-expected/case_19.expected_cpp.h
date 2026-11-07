#pragma once

#include "case_19_domain.hpp"
#include <boost/optional.hpp>
#include <boost/variant.hpp>
#include <nlohmann/json.hpp>
#include <stdexcept>
#include <string>
#include <unordered_map>
#include <vector>

namespace CASE_19_APP {
    struct AnyEvent : boost::variant<
        CASE_19_DOMAIN::Created,
        CASE_19_DOMAIN::Deleted
    > {
        using variant::variant;
        using variant::operator=;
    };

    struct Archived {
        CASE_19_DOMAIN::EventKind kind;
        std::string id;
    };

    using MixedEvent = boost::variant<
        CASE_19_DOMAIN::Created,
        Archived
    >;

    struct AnyMessage : boost::variant<
        CASE_19_DOMAIN::Message<CASE_19_DOMAIN::MessageType, CASE_19_DOMAIN::Notice>,
        CASE_19_DOMAIN::Message<CASE_19_DOMAIN::MessageType, CASE_19_DOMAIN::Alert>
    > {
        using variant::variant;
        using variant::operator=;
    };

    struct EventLog {
        AnyEvent event;
        MixedEvent mixed;
        AnyMessage message;
        std::vector<AnyEvent> history;
        boost::optional<AnyEvent> last;
        std::unordered_map<std::string, AnyEvent> by_id;
    };

}

namespace CASE_19_APP {
    #ifndef NLOHMANN_OPTIONAL_HELPER_CASE_19_APP
    #define NLOHMANN_OPTIONAL_HELPER_CASE_19_APP
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

    inline void to_json(nlohmann::json& j, const AnyEvent& x) {
        if (x.type() == typeid(CASE_19_DOMAIN::Created)) {
            j = boost::get<CASE_19_DOMAIN::Created>(x);
        }
        else if (x.type() == typeid(CASE_19_DOMAIN::Deleted)) {
            j = boost::get<CASE_19_DOMAIN::Deleted>(x);
        }
        else {
            throw std::runtime_error("Unknown AnyEvent type.");
        }
    }

    inline void from_json(const nlohmann::json& j, AnyEvent& x) {
        const auto& k = j.at("kind").get<std::string>();
        if (k == "Created") {
            x = j.get<CASE_19_DOMAIN::Created>();
        }
        else if (k == "Deleted") {
            x = j.get<CASE_19_DOMAIN::Deleted>();
        }
        else {
            // None of the types matched. Error
            throw std::runtime_error("Failed to deserialize AnyEvent: unknown format");
        }
    }

    inline void to_json(nlohmann::json& j, const Archived& x) {
        j["kind"] = x.kind;
        j["id"] = x.id;
    }

    inline void from_json(const nlohmann::json& j, Archived& x) {
        x.kind = j.at("kind").get<CASE_19_DOMAIN::EventKind>();
        x.id = j.at("id").get<std::string>();
    }

    inline void to_json(nlohmann::json& j, const MixedEvent& x) {
        if (x.type() == typeid(CASE_19_DOMAIN::Created)) {
            j = boost::get<CASE_19_DOMAIN::Created>(x);
        }
        else if (x.type() == typeid(Archived)) {
            j = boost::get<Archived>(x);
        }
        else {
            throw std::runtime_error("Unknown MixedEvent type.");
        }
    }

    inline void from_json(const nlohmann::json& j, MixedEvent& x) {
        const auto& k = j.at("kind").get<std::string>();
        if (k == "Created") {
            x = j.get<CASE_19_DOMAIN::Created>();
        }
        else if (k == "Archived") {
            x = j.get<Archived>();
        }
        else {
            // None of the types matched. Error
            throw std::runtime_error("Failed to deserialize MixedEvent: unknown format");
        }
    }

    inline void to_json(nlohmann::json& j, const AnyMessage& x) {
        if (x.type() == typeid(CASE_19_DOMAIN::Message<CASE_19_DOMAIN::MessageType, CASE_19_DOMAIN::Notice>)) {
            j = boost::get<CASE_19_DOMAIN::Message<CASE_19_DOMAIN::MessageType, CASE_19_DOMAIN::Notice>>(x);
        }
        else if (x.type() == typeid(CASE_19_DOMAIN::Message<CASE_19_DOMAIN::MessageType, CASE_19_DOMAIN::Alert>)) {
            j = boost::get<CASE_19_DOMAIN::Message<CASE_19_DOMAIN::MessageType, CASE_19_DOMAIN::Alert>>(x);
        }
        else {
            throw std::runtime_error("Unknown AnyMessage type.");
        }
    }

    inline void from_json(const nlohmann::json& j, AnyMessage& x) {
        const auto& k = j.at("type").get<std::string>();
        if (k == "Info") {
            x = j.get<CASE_19_DOMAIN::Message<CASE_19_DOMAIN::MessageType, CASE_19_DOMAIN::Notice>>();
        }
        else if (k == "Alert") {
            x = j.get<CASE_19_DOMAIN::Message<CASE_19_DOMAIN::MessageType, CASE_19_DOMAIN::Alert>>();
        }
        else {
            // None of the types matched. Error
            throw std::runtime_error("Failed to deserialize AnyMessage: unknown format");
        }
    }

    inline void to_json(nlohmann::json& j, const EventLog& x) {
        j["event"] = x.event;
        j["mixed"] = x.mixed;
        j["message"] = x.message;
        j["history"] = x.history;
        CASE_19_APP::set_opt<AnyEvent>(j, "last", x.last);
        j["byId"] = x.by_id;
    }

    inline void from_json(const nlohmann::json& j, EventLog& x) {
        x.event = j.at("event").get<AnyEvent>();
        x.mixed = j.at("mixed").get<MixedEvent>();
        x.message = j.at("message").get<AnyMessage>();
        x.history = j.at("history").get<std::vector<AnyEvent>>();
        x.last = CASE_19_APP::get_opt<AnyEvent>(j, "last");
        x.by_id = j.at("byId").get<std::unordered_map<std::string, AnyEvent>>();
    }

}
