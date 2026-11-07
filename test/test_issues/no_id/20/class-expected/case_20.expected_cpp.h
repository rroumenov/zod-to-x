#pragma once

#include "case_20_domain.hpp"
#include <nlohmann/json.hpp>
#include <string>
#include <vector>

namespace CASE_20_APP {
    class Usage {
    private:
        CASE_20_DOMAIN::ItemBox item_box;
        CASE_20_DOMAIN::StrBox str_box;
        CASE_20_DOMAIN::SortBox sort_box;
        CASE_20_DOMAIN::ItemPair item_pair;
        std::vector<CASE_20_DOMAIN::ItemPair> pairs;
        CASE_20_DOMAIN::AnyMessage message;
    
    public:
        Usage() = default;
        virtual ~Usage() = default;
        
        const CASE_20_DOMAIN::ItemBox& get_item_box() const { return this->item_box; }
        CASE_20_DOMAIN::ItemBox& get_mut_item_box() { return this->item_box; }
        void set_item_box(const CASE_20_DOMAIN::ItemBox& value) { this->item_box = value; }
        
        const CASE_20_DOMAIN::StrBox& get_str_box() const { return this->str_box; }
        CASE_20_DOMAIN::StrBox& get_mut_str_box() { return this->str_box; }
        void set_str_box(const CASE_20_DOMAIN::StrBox& value) { this->str_box = value; }
        
        const CASE_20_DOMAIN::SortBox& get_sort_box() const { return this->sort_box; }
        CASE_20_DOMAIN::SortBox& get_mut_sort_box() { return this->sort_box; }
        void set_sort_box(const CASE_20_DOMAIN::SortBox& value) { this->sort_box = value; }
        
        const CASE_20_DOMAIN::ItemPair& get_item_pair() const { return this->item_pair; }
        CASE_20_DOMAIN::ItemPair& get_mut_item_pair() { return this->item_pair; }
        void set_item_pair(const CASE_20_DOMAIN::ItemPair& value) { this->item_pair = value; }
        
        const std::vector<CASE_20_DOMAIN::ItemPair>& get_pairs() const { return this->pairs; }
        std::vector<CASE_20_DOMAIN::ItemPair>& get_mut_pairs() { return this->pairs; }
        void set_pairs(const std::vector<CASE_20_DOMAIN::ItemPair>& value) { this->pairs = value; }
        
        const CASE_20_DOMAIN::AnyMessage& get_message() const { return this->message; }
        CASE_20_DOMAIN::AnyMessage& get_mut_message() { return this->message; }
        void set_message(const CASE_20_DOMAIN::AnyMessage& value) { this->message = value; }
    };

}

namespace CASE_20_APP {
    inline void to_json(nlohmann::json& j, const Usage& x) {
        j["itemBox"] = x.get_item_box();
        j["strBox"] = x.get_str_box();
        j["sortBox"] = x.get_sort_box();
        j["itemPair"] = x.get_item_pair();
        j["pairs"] = x.get_pairs();
        j["message"] = x.get_message();
    }

    inline void from_json(const nlohmann::json& j, Usage& x) {
        x.set_item_box(j.at("itemBox").get<CASE_20_DOMAIN::ItemBox>());
        x.set_str_box(j.at("strBox").get<CASE_20_DOMAIN::StrBox>());
        x.set_sort_box(j.at("sortBox").get<CASE_20_DOMAIN::SortBox>());
        x.set_item_pair(j.at("itemPair").get<CASE_20_DOMAIN::ItemPair>());
        x.set_pairs(j.at("pairs").get<std::vector<CASE_20_DOMAIN::ItemPair>>());
        x.set_message(j.at("message").get<CASE_20_DOMAIN::AnyMessage>());
    }

}
