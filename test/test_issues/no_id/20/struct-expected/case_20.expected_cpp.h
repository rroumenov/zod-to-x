#pragma once

#include "case_20_domain.hpp"
#include <nlohmann/json.hpp>
#include <string>
#include <vector>

namespace CASE_20_APP {
    struct Usage {
        CASE_20_DOMAIN::ItemBox item_box;
        CASE_20_DOMAIN::StrBox str_box;
        CASE_20_DOMAIN::SortBox sort_box;
        CASE_20_DOMAIN::ItemPair item_pair;
        std::vector<CASE_20_DOMAIN::ItemPair> pairs;
        CASE_20_DOMAIN::AnyMessage message;
    };

}

namespace CASE_20_APP {
    inline void to_json(nlohmann::json& j, const Usage& x) {
        j["itemBox"] = x.item_box;
        j["strBox"] = x.str_box;
        j["sortBox"] = x.sort_box;
        j["itemPair"] = x.item_pair;
        j["pairs"] = x.pairs;
        j["message"] = x.message;
    }

    inline void from_json(const nlohmann::json& j, Usage& x) {
        x.item_box = j.at("itemBox").get<CASE_20_DOMAIN::ItemBox>();
        x.str_box = j.at("strBox").get<CASE_20_DOMAIN::StrBox>();
        x.sort_box = j.at("sortBox").get<CASE_20_DOMAIN::SortBox>();
        x.item_pair = j.at("itemPair").get<CASE_20_DOMAIN::ItemPair>();
        x.pairs = j.at("pairs").get<std::vector<CASE_20_DOMAIN::ItemPair>>();
        x.message = j.at("message").get<CASE_20_DOMAIN::AnyMessage>();
    }

}
