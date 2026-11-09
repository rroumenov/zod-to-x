#pragma once

#include "case_21_domain.hpp"
#include <boost/optional.hpp>
#include <nlohmann/json.hpp>
#include <string>
#include <vector>

namespace CASE_21_APP {
    // Identifier of the UTM campaign.
    using UtmId = CASE_21_DOMAIN::Uuid;

    // Where the order is sent.
    struct ShippingAddress : public CASE_21_DOMAIN::Address {};

    // Currency of the payment.
    using PaymentCurrency = CASE_21_DOMAIN::Currency;

    // Tags of the order.
    using OrderTags = CASE_21_DOMAIN::Tags;

    // Description of the alias.
    using Renamed = CASE_21_DOMAIN::Documented;

    // Description of the base type.
    using Restated = CASE_21_DOMAIN::Documented;

    using Inherited = CASE_21_DOMAIN::Documented;

    using Undocumented = CASE_21_DOMAIN::Uuid;

    struct Contact {
        std::string email;
    };

    // Contact that places the order.
    struct Customer : public Contact {};

    struct Order {
        // Field redefining the base description.
        CASE_21_DOMAIN::Documented redefined;
        // Description of the base type.
        CASE_21_DOMAIN::Documented restated;
        // Field documenting an undocumented type.
        CASE_21_DOMAIN::Uuid documented;
        // Described before optional.
        boost::optional<CASE_21_DOMAIN::Uuid> described_before;
        // Described after optional.
        boost::optional<CASE_21_DOMAIN::Uuid> described_after;
        // List of identifiers.
        std::vector<CASE_21_DOMAIN::Uuid> list;
        // Field of an object type.
        CASE_21_DOMAIN::Address address;
        // Field of an enum type.
        CASE_21_DOMAIN::Currency currency;
        // Field of a basic type.
        std::string local;
        CASE_21_DOMAIN::Documented plain;
        boost::optional<CASE_21_DOMAIN::Documented> plain_optional;
    };

}

namespace CASE_21_APP {
    #ifndef NLOHMANN_OPTIONAL_HELPER_CASE_21_APP
    #define NLOHMANN_OPTIONAL_HELPER_CASE_21_APP
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

    inline void to_json(nlohmann::json& j, const ShippingAddress& x) {
        CASE_21_DOMAIN::to_json(j, x);
    }

    inline void from_json(const nlohmann::json& j, ShippingAddress& x) {
        CASE_21_DOMAIN::from_json(j, x);
    }

    inline void to_json(nlohmann::json& j, const Contact& x) {
        j["email"] = x.email;
    }

    inline void from_json(const nlohmann::json& j, Contact& x) {
        x.email = j.at("email").get<std::string>();
    }

    inline void to_json(nlohmann::json& j, const Order& x) {
        j["redefined"] = x.redefined;
        j["restated"] = x.restated;
        j["documented"] = x.documented;
        CASE_21_APP::set_opt<CASE_21_DOMAIN::Uuid>(j, "describedBefore", x.described_before);
        CASE_21_APP::set_opt<CASE_21_DOMAIN::Uuid>(j, "describedAfter", x.described_after);
        j["list"] = x.list;
        j["address"] = x.address;
        j["currency"] = x.currency;
        j["local"] = x.local;
        j["plain"] = x.plain;
        CASE_21_APP::set_opt<CASE_21_DOMAIN::Documented>(j, "plainOptional", x.plain_optional);
    }

    inline void from_json(const nlohmann::json& j, Order& x) {
        x.redefined = j.at("redefined").get<CASE_21_DOMAIN::Documented>();
        x.restated = j.at("restated").get<CASE_21_DOMAIN::Documented>();
        x.documented = j.at("documented").get<CASE_21_DOMAIN::Uuid>();
        x.described_before = CASE_21_APP::get_opt<CASE_21_DOMAIN::Uuid>(j, "describedBefore");
        x.described_after = CASE_21_APP::get_opt<CASE_21_DOMAIN::Uuid>(j, "describedAfter");
        x.list = j.at("list").get<std::vector<CASE_21_DOMAIN::Uuid>>();
        x.address = j.at("address").get<CASE_21_DOMAIN::Address>();
        x.currency = j.at("currency").get<CASE_21_DOMAIN::Currency>();
        x.local = j.at("local").get<std::string>();
        x.plain = j.at("plain").get<CASE_21_DOMAIN::Documented>();
        x.plain_optional = CASE_21_APP::get_opt<CASE_21_DOMAIN::Documented>(j, "plainOptional");
    }

}