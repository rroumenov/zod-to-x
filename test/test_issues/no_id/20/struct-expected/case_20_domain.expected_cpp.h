#pragma once

#include <boost/variant.hpp>
#include <nlohmann/json.hpp>
#include <stdexcept>
#include <string>
#include <vector>

namespace CASE_20_DOMAIN {
    enum class SortField: int {
        Name,
        Date
    };

    struct Item {
        std::string id;
    };

    template<typename T>
    struct Box {
        T value;
    };

    template<typename A, typename B>
    struct Pair {
        A first;
        B second;
    };

    struct ItemBox : public Box<Item> {};

    struct StrBox : public Box<std::string> {};

    struct SortBox : public Box<SortField> {};

    struct ItemPair : public Pair<Item, SortField> {};

    enum class MessageType: int {
        Ping,
        Sort,
        Item
    };

    template<typename K, typename P>
    struct Message {
        K type;
        P payload;
    };

    using AnyMessage = boost::variant<
        Message<MessageType, std::string>,
        Message<MessageType, SortField>,
        Message<MessageType, Item>
    >;

    struct Holder {
        AnyMessage message;
        std::vector<AnyMessage> messages;
    };

}

namespace CASE_20_DOMAIN {
    inline void to_json(nlohmann::json& j, const SortField& x) {
        switch (x) {
            case SortField::Name: j = "Name"; break;
            case SortField::Date: j = "Date"; break;
            default: throw std::runtime_error("Unexpected value serializing enum SortField: " + std::to_string(static_cast<int>(x)));
        }
    }

    inline void from_json(const nlohmann::json& j, SortField& x) {
        if (j == "Name") x = SortField::Name;
        else if (j == "Date") x = SortField::Date;
        else { throw std::runtime_error("Unexpected value deserializing enum SortField."); }
    }

    inline void to_json(nlohmann::json& j, const Item& x) {
        j["id"] = x.id;
    }

    inline void from_json(const nlohmann::json& j, Item& x) {
        x.id = j.at("id").get<std::string>();
    }

    template<typename T>
    inline void to_json(nlohmann::json& j, const Box<T>& x) {
        j["value"] = x.value;
    }

    template<typename T>
    inline void from_json(const nlohmann::json& j, Box<T>& x) {
        x.value = j.at("value").get<T>();
    }

    template<typename A, typename B>
    inline void to_json(nlohmann::json& j, const Pair<A, B>& x) {
        j["first"] = x.first;
        j["second"] = x.second;
    }

    template<typename A, typename B>
    inline void from_json(const nlohmann::json& j, Pair<A, B>& x) {
        x.first = j.at("first").get<A>();
        x.second = j.at("second").get<B>();
    }

    inline void to_json(nlohmann::json& j, const MessageType& x) {
        switch (x) {
            case MessageType::Ping: j = "Ping"; break;
            case MessageType::Sort: j = "Sort"; break;
            case MessageType::Item: j = "Item"; break;
            default: throw std::runtime_error("Unexpected value serializing enum MessageType: " + std::to_string(static_cast<int>(x)));
        }
    }

    inline void from_json(const nlohmann::json& j, MessageType& x) {
        if (j == "Ping") x = MessageType::Ping;
        else if (j == "Sort") x = MessageType::Sort;
        else if (j == "Item") x = MessageType::Item;
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

    inline void to_json(nlohmann::json& j, const AnyMessage& x) {
        if (x.type() == typeid(Message<MessageType, std::string>)) {
            j = boost::get<Message<MessageType, std::string>>(x);
        }
        else if (x.type() == typeid(Message<MessageType, SortField>)) {
            j = boost::get<Message<MessageType, SortField>>(x);
        }
        else if (x.type() == typeid(Message<MessageType, Item>)) {
            j = boost::get<Message<MessageType, Item>>(x);
        }
        else {
            throw std::runtime_error("Unknown AnyMessage type.");
        }
    }

    inline void from_json(const nlohmann::json& j, AnyMessage& x) {
        const auto& k = j.at("type").get<std::string>();
        if (k == "Ping") {
            x = j.get<Message<MessageType, std::string>>();
        }
        else if (k == "Sort") {
            x = j.get<Message<MessageType, SortField>>();
        }
        else if (k == "Item") {
            x = j.get<Message<MessageType, Item>>();
        }
        else {
            // None of the types matched. Error
            throw std::runtime_error("Failed to deserialize AnyMessage: unknown format");
        }
    }

    inline void to_json(nlohmann::json& j, const Holder& x) {
        j["message"] = x.message;
        j["messages"] = x.messages;
    }

    inline void from_json(const nlohmann::json& j, Holder& x) {
        x.message = j.at("message").get<AnyMessage>();
        x.messages = j.at("messages").get<std::vector<AnyMessage>>();
    }

}
