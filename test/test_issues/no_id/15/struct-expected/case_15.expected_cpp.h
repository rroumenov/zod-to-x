#pragma once

#include "case_15_domain.hpp"
#include <nlohmann/json.hpp>
#include <string>

namespace CASE_15_APP {
    struct Price : public CASE_15_DOMAIN::Money {};

    struct Invoice {
        std::string id;
        CASE_15_DOMAIN::Money total;
    };

}

namespace CASE_15_APP {
    inline void to_json(nlohmann::json& j, const Price& x) {
        CASE_15_DOMAIN::to_json(j, x);
    }

    inline void from_json(const nlohmann::json& j, Price& x) {
        CASE_15_DOMAIN::from_json(j, x);
    }

    inline void to_json(nlohmann::json& j, const Invoice& x) {
        j["id"] = x.id;
        j["total"] = x.total;
    }

    inline void from_json(const nlohmann::json& j, Invoice& x) {
        x.id = j.at("id").get<std::string>();
        x.total = j.at("total").get<CASE_15_DOMAIN::Money>();
    }

}