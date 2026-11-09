#pragma once

#include "case_12_domain.hpp"
#include <nlohmann/json.hpp>
#include <string>

namespace CASE_12_APP {
    struct ShippingAddress : public CASE_12_DOMAIN::Address {};

    struct ShippingRequest {
        std::string order_id;
        CASE_12_DOMAIN::Address destination;
    };

}

namespace CASE_12_APP {
    inline void to_json(nlohmann::json& j, const ShippingAddress& x) {
        CASE_12_DOMAIN::to_json(j, x);
    }

    inline void from_json(const nlohmann::json& j, ShippingAddress& x) {
        CASE_12_DOMAIN::from_json(j, x);
    }

    inline void to_json(nlohmann::json& j, const ShippingRequest& x) {
        j["orderId"] = x.order_id;
        j["destination"] = x.destination;
    }

    inline void from_json(const nlohmann::json& j, ShippingRequest& x) {
        x.order_id = j.at("orderId").get<std::string>();
        x.destination = j.at("destination").get<CASE_12_DOMAIN::Address>();
    }

}