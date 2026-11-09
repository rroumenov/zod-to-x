#pragma once

#include "case_21_domain.hpp"
#include <nlohmann/json.hpp>
#include <string>

namespace CASE_21_APP {
    // Identifier of the UTM campaign.
    using UtmId = CASE_21_DOMAIN::Uuid;

    // Where the order is sent.
    class ShippingAddress : public CASE_21_DOMAIN::Address {};

    // Currency of the payment.
    using PaymentCurrency = CASE_21_DOMAIN::Currency;

    // Tags of the order.
    using OrderTags = CASE_21_DOMAIN::Tags;

    // Description of the alias.
    using Renamed = CASE_21_DOMAIN::Documented;

    using Inherited = CASE_21_DOMAIN::Documented;

    using Undocumented = CASE_21_DOMAIN::Uuid;

    class Contact {
    private:
        std::string email;
    
    public:
        Contact() = default;
        virtual ~Contact() = default;
        
        const std::string& get_email() const { return this->email; }
        std::string& get_mut_email() { return this->email; }
        void set_email(const std::string& value) { this->email = value; }
    };

    // Contact that places the order.
    class Customer : public Contact {};

}

namespace CASE_21_APP {
    inline void to_json(nlohmann::json& j, const ShippingAddress& x) {
        CASE_21_DOMAIN::to_json(j, x);
    }

    inline void from_json(const nlohmann::json& j, ShippingAddress& x) {
        CASE_21_DOMAIN::from_json(j, x);
    }

    inline void to_json(nlohmann::json& j, const Contact& x) {
        j["email"] = x.get_email();
    }

    inline void from_json(const nlohmann::json& j, Contact& x) {
        x.set_email(j.at("email").get<std::string>());
    }

}