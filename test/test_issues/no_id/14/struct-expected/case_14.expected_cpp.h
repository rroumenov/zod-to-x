#pragma once

#include <cstdint>
#include <nlohmann/json.hpp>
#include <string>
#include <vector>

namespace CASE_14_DOMAIN {
    struct Item {
        std::string id;
        double price;
    };

    template<typename TCursor, typename TContent>
    struct Page {
        TCursor cursor;
        TContent content;
        std::int64_t total;
    };

    struct PageDefault : public Page<std::string, Item> {};

    struct PageOfNumbers : public Page<std::string, std::vector<double>> {};

    struct PageCustom : public Page<std::int64_t, std::vector<Item>> {};

    struct Catalog {
        Page<std::string, Item> first_page;
    };

}

namespace CASE_14_DOMAIN {
    inline void to_json(nlohmann::json& j, const Item& x) {
        j["id"] = x.id;
        j["price"] = x.price;
    }

    inline void from_json(const nlohmann::json& j, Item& x) {
        x.id = j.at("id").get<std::string>();
        x.price = j.at("price").get<double>();
    }

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

    inline void to_json(nlohmann::json& j, const Catalog& x) {
        j["firstPage"] = x.first_page;
    }

    inline void from_json(const nlohmann::json& j, Catalog& x) {
        x.first_page = j.at("firstPage").get<Page<std::string, Item>>();
    }

}