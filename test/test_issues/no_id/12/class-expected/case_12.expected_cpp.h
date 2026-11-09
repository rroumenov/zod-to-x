#pragma once

#include "case_12_domain.hpp"
#include <nlohmann/json.hpp>
#include <string>

namespace CASE_12_APP {
    class ShippingAddress : public CASE_12_DOMAIN::Address {};

    class ShippingRequest {
    private:
        std::string order_id;
        CASE_12_DOMAIN::Address destination;
    
    public:
        ShippingRequest() = default;
        virtual ~ShippingRequest() = default;
        
        const std::string& get_order_id() const { return this->order_id; }
        std::string& get_mut_order_id() { return this->order_id; }
        void set_order_id(const std::string& value) { this->order_id = value; }
        
        const CASE_12_DOMAIN::Address& get_destination() const { return this->destination; }
        CASE_12_DOMAIN::Address& get_mut_destination() { return this->destination; }
        void set_destination(const CASE_12_DOMAIN::Address& value) { this->destination = value; }
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
        j["orderId"] = x.get_order_id();
        j["destination"] = x.get_destination();
    }

    inline void from_json(const nlohmann::json& j, ShippingRequest& x) {
        x.set_order_id(j.at("orderId").get<std::string>());
        x.set_destination(j.at("destination").get<CASE_12_DOMAIN::Address>());
    }

}