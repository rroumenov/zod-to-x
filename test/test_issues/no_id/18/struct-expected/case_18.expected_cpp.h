#pragma once

#include <boost/optional.hpp>
#include <boost/variant.hpp>
#include <nlohmann/json.hpp>
#include <stdexcept>
#include <string>

namespace CASE_18 {
    enum class MessageType: int {
        UserCreated,
        UserDeleted
    };

    struct UserCreated {
        std::string id;
        std::string name;
    };

    struct UserDeleted {
        std::string id;
        boost::optional<std::string> reason;
    };

    template<typename K, typename P>
    struct Message {
        K type;
        P payload;
        double sent_at;
    };

    using AnyMessage = boost::variant<
        Message<MessageType, UserCreated>,
        Message<MessageType, UserDeleted>
    >;

}

namespace CASE_18 {
    #ifndef NLOHMANN_OPTIONAL_HELPER_CASE_18
    #define NLOHMANN_OPTIONAL_HELPER_CASE_18
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

    inline void to_json(nlohmann::json& j, const MessageType& x) {
        switch (x) {
            case MessageType::UserCreated: j = "UserCreated"; break;
            case MessageType::UserDeleted: j = "UserDeleted"; break;
            default: throw std::runtime_error("Unexpected value serializing enum MessageType: " + std::to_string(static_cast<int>(x)));
        }
    }

    inline void from_json(const nlohmann::json& j, MessageType& x) {
        if (j == "UserCreated") x = MessageType::UserCreated;
        else if (j == "UserDeleted") x = MessageType::UserDeleted;
        else { throw std::runtime_error("Unexpected value deserializing enum MessageType."); }
    }

    inline void to_json(nlohmann::json& j, const UserCreated& x) {
        j["id"] = x.id;
        j["name"] = x.name;
    }

    inline void from_json(const nlohmann::json& j, UserCreated& x) {
        x.id = j.at("id").get<std::string>();
        x.name = j.at("name").get<std::string>();
    }

    inline void to_json(nlohmann::json& j, const UserDeleted& x) {
        j["id"] = x.id;
        CASE_18::set_opt<std::string>(j, "reason", x.reason);
    }

    inline void from_json(const nlohmann::json& j, UserDeleted& x) {
        x.id = j.at("id").get<std::string>();
        x.reason = CASE_18::get_opt<std::string>(j, "reason");
    }

    template<typename K, typename P>
    inline void to_json(nlohmann::json& j, const Message<K, P>& x) {
        j["type"] = x.type;
        j["payload"] = x.payload;
        j["sentAt"] = x.sent_at;
    }

    template<typename K, typename P>
    inline void from_json(const nlohmann::json& j, Message<K, P>& x) {
        x.type = j.at("type").get<K>();
        x.payload = j.at("payload").get<P>();
        x.sent_at = j.at("sentAt").get<double>();
    }

    inline void to_json(nlohmann::json& j, const AnyMessage& x) {
        if (x.type() == typeid(Message<MessageType, UserCreated>)) {
            j = boost::get<Message<MessageType, UserCreated>>(x);
        }
        else if (x.type() == typeid(Message<MessageType, UserDeleted>)) {
            j = boost::get<Message<MessageType, UserDeleted>>(x);
        }
        else {
            throw std::runtime_error("Unknown AnyMessage type.");
        }
    }

    inline void from_json(const nlohmann::json& j, AnyMessage& x) {
        const auto& k = j.at("type").get<std::string>();
        if (k == "UserCreated") {
            x = j.get<Message<MessageType, UserCreated>>();
        }
        else if (k == "UserDeleted") {
            x = j.get<Message<MessageType, UserDeleted>>();
        }
        else {
            // None of the types matched. Error
            throw std::runtime_error("Failed to deserialize AnyMessage: unknown format");
        }
    }

}
