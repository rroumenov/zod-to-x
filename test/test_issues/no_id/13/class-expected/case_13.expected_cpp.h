#pragma once

#include <cstdint>
#include <nlohmann/json.hpp>
#include <string>
#include <vector>

namespace CASE_13_DOMAIN {
    template<typename TCursor, typename TContent>
    class Page {
    private:
        TCursor cursor;
        TContent content;
        std::int64_t total;
    
    public:
        Page() = default;
        virtual ~Page() = default;
        
        const TCursor& get_cursor() const { return this->cursor; }
        TCursor& get_mut_cursor() { return this->cursor; }
        void set_cursor(const TCursor& value) { this->cursor = value; }
        
        const TContent& get_content() const { return this->content; }
        TContent& get_mut_content() { return this->content; }
        void set_content(const TContent& value) { this->content = value; }
        
        const std::int64_t& get_total() const { return this->total; }
        std::int64_t& get_mut_total() { return this->total; }
        void set_total(const std::int64_t& value) { this->total = value; }
    };

    class Item {
    private:
        std::string id;
        double price;
    
    public:
        Item() = default;
        virtual ~Item() = default;
        
        const std::string& get_id() const { return this->id; }
        std::string& get_mut_id() { return this->id; }
        void set_id(const std::string& value) { this->id = value; }
        
        const double& get_price() const { return this->price; }
        double& get_mut_price() { return this->price; }
        void set_price(const double& value) { this->price = value; }
    };

    class PageOfItems : public Page<std::int64_t, Item> {};

    class PageOfIds : public Page<std::string, std::vector<std::string>> {};

}

namespace CASE_13_DOMAIN {
    template<typename TCursor, typename TContent>
    inline void to_json(nlohmann::json& j, const Page<TCursor, TContent>& x) {
        j["cursor"] = x.get_cursor();
        j["content"] = x.get_content();
        j["total"] = x.get_total();
    }

    template<typename TCursor, typename TContent>
    inline void from_json(const nlohmann::json& j, Page<TCursor, TContent>& x) {
        x.set_cursor(j.at("cursor").get<TCursor>());
        x.set_content(j.at("content").get<TContent>());
        x.set_total(j.at("total").get<std::int64_t>());
    }

    inline void to_json(nlohmann::json& j, const Item& x) {
        j["id"] = x.get_id();
        j["price"] = x.get_price();
    }

    inline void from_json(const nlohmann::json& j, Item& x) {
        x.set_id(j.at("id").get<std::string>());
        x.set_price(j.at("price").get<double>());
    }

}