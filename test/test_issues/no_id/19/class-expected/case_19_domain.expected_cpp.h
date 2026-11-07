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

    class Created {
    private:
        EventKind kind;
        std::string id;
    
    public:
        Created() = default;
        virtual ~Created() = default;
        
        const EventKind& get_kind() const { return this->kind; }
        EventKind& get_mut_kind() { return this->kind; }
        void set_kind(const EventKind& value) { this->kind = value; }
        
        const std::string& get_id() const { return this->id; }
        std::string& get_mut_id() { return this->id; }
        void set_id(const std::string& value) { this->id = value; }
    };

    class Deleted {
    private:
        EventKind kind;
        std::string id;
        boost::optional<std::string> reason;
    
    public:
        Deleted() = default;
        virtual ~Deleted() = default;
        
        const EventKind& get_kind() const { return this->kind; }
        EventKind& get_mut_kind() { return this->kind; }
        void set_kind(const EventKind& value) { this->kind = value; }
        
        const std::string& get_id() const { return this->id; }
        std::string& get_mut_id() { return this->id; }
        void set_id(const std::string& value) { this->id = value; }
        
        boost::optional<std::string> get_reason() const { return this->reason; }
        void set_reason(boost::optional<std::string> value) { this->reason = value; }
    };

    enum class MessageType: int {
        Info,
        Alert
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

    class Notice {
    private:
        std::string text;
    
    public:
        Notice() = default;
        virtual ~Notice() = default;
        
        const std::string& get_text() const { return this->text; }
        std::string& get_mut_text() { return this->text; }
        void set_text(const std::string& value) { this->text = value; }
    };

    class Alert {
    private:
        std::string text;
        std::int64_t level;
    
    public:
        Alert() = default;
        virtual ~Alert() = default;
        
        const std::string& get_text() const { return this->text; }
        std::string& get_mut_text() { return this->text; }
        void set_text(const std::string& value) { this->text = value; }
        
        const std::int64_t& get_level() const { return this->level; }
        std::int64_t& get_mut_level() { return this->level; }
        void set_level(const std::int64_t& value) { this->level = value; }
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
        j["kind"] = x.get_kind();
        j["id"] = x.get_id();
    }

    inline void from_json(const nlohmann::json& j, Created& x) {
        x.set_kind(j.at("kind").get<EventKind>());
        x.set_id(j.at("id").get<std::string>());
    }

    inline void to_json(nlohmann::json& j, const Deleted& x) {
        j["kind"] = x.get_kind();
        j["id"] = x.get_id();
        CASE_19_DOMAIN::set_opt<std::string>(j, "reason", x.get_reason());
    }

    inline void from_json(const nlohmann::json& j, Deleted& x) {
        x.set_kind(j.at("kind").get<EventKind>());
        x.set_id(j.at("id").get<std::string>());
        x.set_reason(CASE_19_DOMAIN::get_opt<std::string>(j, "reason"));
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
        j["type"] = x.get_type();
        j["payload"] = x.get_payload();
    }

    template<typename K, typename P>
    inline void from_json(const nlohmann::json& j, Message<K, P>& x) {
        x.set_type(j.at("type").get<K>());
        x.set_payload(j.at("payload").get<P>());
    }

    inline void to_json(nlohmann::json& j, const Notice& x) {
        j["text"] = x.get_text();
    }

    inline void from_json(const nlohmann::json& j, Notice& x) {
        x.set_text(j.at("text").get<std::string>());
    }

    inline void to_json(nlohmann::json& j, const Alert& x) {
        j["text"] = x.get_text();
        j["level"] = x.get_level();
    }

    inline void from_json(const nlohmann::json& j, Alert& x) {
        x.set_text(j.at("text").get<std::string>());
        x.set_level(j.at("level").get<std::int64_t>());
    }

}
