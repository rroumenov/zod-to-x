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

    class UserCreated {
    private:
        std::string id;
        std::string name;
    
    public:
        UserCreated() = default;
        virtual ~UserCreated() = default;
        
        const std::string& get_id() const { return this->id; }
        std::string& get_mut_id() { return this->id; }
        void set_id(const std::string& value) { this->id = value; }
        
        const std::string& get_name() const { return this->name; }
        std::string& get_mut_name() { return this->name; }
        void set_name(const std::string& value) { this->name = value; }
    };

    class UserDeleted {
    private:
        std::string id;
        boost::optional<std::string> reason;
    
    public:
        UserDeleted() = default;
        virtual ~UserDeleted() = default;
        
        const std::string& get_id() const { return this->id; }
        std::string& get_mut_id() { return this->id; }
        void set_id(const std::string& value) { this->id = value; }
        
        boost::optional<std::string> get_reason() const { return this->reason; }
        void set_reason(boost::optional<std::string> value) { this->reason = value; }
    };

    template<typename K, typename P>
    class Message {
    private:
        K type;
        P payload;
        double sent_at;
    
    public:
        Message() = default;
        virtual ~Message() = default;
        
        const K& get_type() const { return this->type; }
        K& get_mut_type() { return this->type; }
        void set_type(const K& value) { this->type = value; }
        
        const P& get_payload() const { return this->payload; }
        P& get_mut_payload() { return this->payload; }
        void set_payload(const P& value) { this->payload = value; }
        
        const double& get_sent_at() const { return this->sent_at; }
        double& get_mut_sent_at() { return this->sent_at; }
        void set_sent_at(const double& value) { this->sent_at = value; }
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
        j["id"] = x.get_id();
        j["name"] = x.get_name();
    }

    inline void from_json(const nlohmann::json& j, UserCreated& x) {
        x.set_id(j.at("id").get<std::string>());
        x.set_name(j.at("name").get<std::string>());
    }

    inline void to_json(nlohmann::json& j, const UserDeleted& x) {
        j["id"] = x.get_id();
        CASE_18::set_opt<std::string>(j, "reason", x.get_reason());
    }

    inline void from_json(const nlohmann::json& j, UserDeleted& x) {
        x.set_id(j.at("id").get<std::string>());
        x.set_reason(CASE_18::get_opt<std::string>(j, "reason"));
    }

    template<typename K, typename P>
    inline void to_json(nlohmann::json& j, const Message<K, P>& x) {
        j["type"] = x.get_type();
        j["payload"] = x.get_payload();
        j["sentAt"] = x.get_sent_at();
    }

    template<typename K, typename P>
    inline void from_json(const nlohmann::json& j, Message<K, P>& x) {
        x.set_type(j.at("type").get<K>());
        x.set_payload(j.at("payload").get<P>());
        x.set_sent_at(j.at("sentAt").get<double>());
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
