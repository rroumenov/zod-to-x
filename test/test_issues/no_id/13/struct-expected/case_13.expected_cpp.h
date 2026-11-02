#pragma once

#include <cstdint>
#include <nlohmann/json.hpp>
#include <string>
#include <vector>

namespace CASE_13_DOMAIN {
    template<typename TCursor, typename TContent>
    struct Page {
        TCursor cursor;
        TContent content;
        std::int64_t total;
    };

    struct Item {
        std::string id;
        double price;
    };

    struct PageOfItems : public Page<std::int64_t, Item> {};

    struct PageOfIds : public Page<std::string, std::vector<std::string>> {};

}

namespace CASE_13_DOMAIN {
    template<typename TCursor, typename TContent>
    inline void to_json(nlohmann::json& j, const Page<TCursor, TContent>& x) {
        j["cursor"] = x.cursor;
        j["content"] = x.content;
        j["total"] = x.total;
    }

    template<typename TCursor, typename TContent>
    inline void from_json(const nlohmann::json& j, Page<TCursor, TContent>& x) {
        x.cursor = j.at("cursor").get<TCursor>();
        x.content = j.at("content").get<TContent>();
        x.total = j.at("total").get<std::int64_t>();
    }

    inline void to_json(nlohmann::json& j, const Item& x) {
        j["id"] = x.id;
        j["price"] = x.price;
    }

    inline void from_json(const nlohmann::json& j, Item& x) {
        x.id = j.at("id").get<std::string>();
        x.price = j.at("price").get<double>();
    }

}