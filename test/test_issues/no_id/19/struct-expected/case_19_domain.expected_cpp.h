#pragma once

#include <boost/optional.hpp>
#include <cstdint>
#include <nlohmann/json.hpp>
#include <stdexcept>
#include <string>

namespace CASE_19_DOMAIN {
    enum class EventKind: int {
        Created,
        Deleted,
        Archived
    };

    struct Created {
        EventKind kind;
        std::string id;
    };

    struct Deleted {
        EventKind kind;
        std::string id;
        boost::optional<std::string> reason;
    };

    enum class MessageType: int {
        Info,
        Alert
    };

    template<typename K, typename P>
    struct Message {
        K type;
        P payload;
    };

    struct Notice {
        std::string text;
    };

    struct Alert {
        std::string text;
        std::int64_t level;
    };

}

namespace CASE_19_DOMAIN {
    #ifndef NLOHMANN_OPTIONAL_HELPER_CASE_19_DOMAIN
    #define NLOHMANN_OPTIONAL_HELPER_CASE_19_DOMAIN
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

    inline void to_json(nlohmann::json& j, const EventKind& x) {
        switch (x) {
            case EventKind::Created: j = "Created"; break;
            case EventKind::Deleted: j = "Deleted"; break;
            case EventKind::Archived: j = "Archived"; break;
            default: throw std::runtime_error("Unexpected value serializing enum EventKind: " + std::to_string(static_cast<int>(x)));
        }
    }

    inline void from_json(const nlohmann::json& j, EventKind& x) {
        if (j == "Created") x = EventKind::Created;
        else if (j == "Deleted") x = EventKind::Deleted;
        else if (j == "Archived") x = EventKind::Archived;
        else { throw std::runtime_error("Unexpected value deserializing enum EventKind."); }
    }

    inline void to_json(nlohmann::json& j, const Created& x) {
        j["kind"] = x.kind;
        j["id"] = x.id;
    }

    inline void from_json(const nlohmann::json& j, Created& x) {
        x.kind = j.at("kind").get<EventKind>();
        x.id = j.at("id").get<std::string>();
    }

    inline void to_json(nlohmann::json& j, const Deleted& x) {
        j["kind"] = x.kind;
        j["id"] = x.id;
        CASE_19_DOMAIN::set_opt<std::string>(j, "reason", x.reason);
    }

    inline void from_json(const nlohmann::json& j, Deleted& x) {
        x.kind = j.at("kind").get<EventKind>();
        x.id = j.at("id").get<std::string>();
        x.reason = CASE_19_DOMAIN::get_opt<std::string>(j, "reason");
    }

    inline void to_json(nlohmann::json& j, const MessageType& x) {
        switch (x) {
            case MessageType::Info: j = "Info"; break;
            case MessageType::Alert: j = "Alert"; break;
            default: throw std::runtime_error("Unexpected value serializing enum MessageType: " + std::to_string(static_cast<int>(x)));
        }
    }

    inline void from_json(const nlohmann::json& j, MessageType& x) {
        if (j == "Info") x = MessageType::Info;
        else if (j == "Alert") x = MessageType::Alert;
        else { throw std::runtime_error("Unexpected value deserializing enum MessageType."); }
    }

    template<typename K, typename P>
    inline void to_json(nlohmann::json& j, const Message<K, P>& x) {
        j["type"] = x.type;
        j["payload"] = x.payload;
    }

    template<typename K, typename P>
    inline void from_json(const nlohmann::json& j, Message<K, P>& x) {
        x.type = j.at("type").get<K>();
        x.payload = j.at("payload").get<P>();
    }

    inline void to_json(nlohmann::json& j, const Notice& x) {
        j["text"] = x.text;
    }

    inline void from_json(const nlohmann::json& j, Notice& x) {
        x.text = j.at("text").get<std::string>();
    }

    inline void to_json(nlohmann::json& j, const Alert& x) {
        j["text"] = x.text;
        j["level"] = x.level;
    }

    inline void from_json(const nlohmann::json& j, Alert& x) {
        x.text = j.at("text").get<std::string>();
        x.level = j.at("level").get<std::int64_t>();
    }

}
