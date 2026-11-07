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

    class Item {
    private:
        std::string id;
    
    public:
        Item() = default;
        virtual ~Item() = default;
        
        const std::string& get_id() const { return this->id; }
        std::string& get_mut_id() { return this->id; }
        void set_id(const std::string& value) { this->id = value; }
    };

    template<typename T>
    class Box {
    private:
        T value;
    
    public:
        Box() = default;
        virtual ~Box() = default;
        
        const T& get_value() const { return this->value; }
        T& get_mut_value() { return this->value; }
        void set_value(const T& value) { this->value = value; }
    };

    template<typename A, typename B>
    class Pair {
    private:
        A first;
        B second;
    
    public:
        Pair() = default;
        virtual ~Pair() = default;
        
        const A& get_first() const { return this->first; }
        A& get_mut_first() { return this->first; }
        void set_first(const A& value) { this->first = value; }
        
        const B& get_second() const { return this->second; }
        B& get_mut_second() { return this->second; }
        void set_second(const B& value) { this->second = value; }
    };

    class ItemBox : public Box<Item> {};

    class StrBox : public Box<std::string> {};

    class SortBox : public Box<SortField> {};

    class ItemPair : public Pair<Item, SortField> {};

    enum class MessageType: int {
        Ping,
        Sort,
        Item
    };

    template<typename K, typename P>
    class Message {
    private:
        K type;
        P payload;
    
    public:
        Message() = default;
        virtual ~Message() = default;
        
        const K& get_type() const { return this->type; }
        K& get_mut_type() { return this->type; }
        void set_type(const K& value) { this->type = value; }
        
        const P& get_payload() const { return this->payload; }
        P& get_mut_payload() { return this->payload; }
        void set_payload(const P& value) { this->payload = value; }
    };

    using AnyMessage = boost::variant<
        Message<MessageType, std::string>,
        Message<MessageType, SortField>,
        Message<MessageType, Item>
    >;

    class Holder {
    private:
        AnyMessage message;
        std::vector<AnyMessage> messages;
    
    public:
        Holder() = default;
        virtual ~Holder() = default;
        
        const AnyMessage& get_message() const { return this->message; }
        AnyMessage& get_mut_message() { return this->message; }
        void set_message(const AnyMessage& value) { this->message = value; }
        
        const std::vector<AnyMessage>& get_messages() const { return this->messages; }
        std::vector<AnyMessage>& get_mut_messages() { return this->messages; }
        void set_messages(const std::vector<AnyMessage>& value) { this->messages = value; }
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
        j["id"] = x.get_id();
    }

    inline void from_json(const nlohmann::json& j, Item& x) {
        x.set_id(j.at("id").get<std::string>());
    }

    template<typename T>
    inline void to_json(nlohmann::json& j, const Box<T>& x) {
        j["value"] = x.get_value();
    }

    template<typename T>
    inline void from_json(const nlohmann::json& j, Box<T>& x) {
        x.set_value(j.at("value").get<T>());
    }

    template<typename A, typename B>
    inline void to_json(nlohmann::json& j, const Pair<A, B>& x) {
        j["first"] = x.get_first();
        j["second"] = x.get_second();
    }

    template<typename A, typename B>
    inline void from_json(const nlohmann::json& j, Pair<A, B>& x) {
        x.set_first(j.at("first").get<A>());
        x.set_second(j.at("second").get<B>());
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
        j["type"] = x.get_type();
        j["payload"] = x.get_payload();
    }

    template<typename K, typename P>
    inline void from_json(const nlohmann::json& j, Message<K, P>& x) {
        x.set_type(j.at("type").get<K>());
        x.set_payload(j.at("payload").get<P>());
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
        j["message"] = x.get_message();
        j["messages"] = x.get_messages();
    }

    inline void from_json(const nlohmann::json& j, Holder& x) {
        x.set_message(j.at("message").get<AnyMessage>());
        x.set_messages(j.at("messages").get<std::vector<AnyMessage>>());
    }

}
