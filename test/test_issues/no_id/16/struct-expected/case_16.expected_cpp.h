#pragma once

#include "case_16_domain.hpp"
#include <boost/optional.hpp>
#include <nlohmann/json.hpp>
#include <string>
#include <vector>

namespace CASE_16_APP {
    struct ShippingAddress : public CASE_16_DOMAIN::Address {};

    struct OrderItem : public CASE_16_DOMAIN::Item {};

    using PaymentCurrency = CASE_16_DOMAIN::Currency;

    using RefundCurrency = CASE_16_DOMAIN::Currency;

    struct Contact {
        std::string email;
    };

    struct Customer : public Contact {};

    struct Order {
        std::string id;
        CASE_16_DOMAIN::Address destination;
        boost::optional<CASE_16_DOMAIN::Address> billing;
        std::vector<CASE_16_DOMAIN::Item> items;
        CASE_16_DOMAIN::Currency currency;
        Contact contact;
    };

    using AddressList = std::vector<CASE_16_DOMAIN::Address>;

    struct OrderItemPage : public CASE_16_DOMAIN::Page<CASE_16_DOMAIN::Item> {};

}

namespace CASE_16_APP {
    #ifndef NLOHMANN_OPTIONAL_HELPER_CASE_16_APP
    #define NLOHMANN_OPTIONAL_HELPER_CASE_16_APP
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
        CASE_16_DOMAIN::to_json(j, x);
    }

    inline void from_json(const nlohmann::json& j, ShippingAddress& x) {
        CASE_16_DOMAIN::from_json(j, x);
    }

    inline void to_json(nlohmann::json& j, const OrderItem& x) {
        CASE_16_DOMAIN::to_json(j, x);
    }

    inline void from_json(const nlohmann::json& j, OrderItem& x) {
        CASE_16_DOMAIN::from_json(j, x);
    }

    inline void to_json(nlohmann::json& j, const Contact& x) {
        j["email"] = x.email;
    }

    inline void from_json(const nlohmann::json& j, Contact& x) {
        x.email = j.at("email").get<std::string>();
    }

    inline void to_json(nlohmann::json& j, const Order& x) {
        j["id"] = x.id;
        j["destination"] = x.destination;
        CASE_16_APP::set_opt<CASE_16_DOMAIN::Address>(j, "billing", x.billing);
        j["items"] = x.items;
        j["currency"] = x.currency;
        j["contact"] = x.contact;
    }

    inline void from_json(const nlohmann::json& j, Order& x) {
        x.id = j.at("id").get<std::string>();
        x.destination = j.at("destination").get<CASE_16_DOMAIN::Address>();
        x.billing = CASE_16_APP::get_opt<CASE_16_DOMAIN::Address>(j, "billing");
        x.items = j.at("items").get<std::vector<CASE_16_DOMAIN::Item>>();
        x.currency = j.at("currency").get<CASE_16_DOMAIN::Currency>();
        x.contact = j.at("contact").get<Contact>();
    }

    inline void to_json(nlohmann::json& j, const OrderItemPage& x) {
        CASE_16_DOMAIN::to_json(j, x);
    }

    inline void from_json(const nlohmann::json& j, OrderItemPage& x) {
        CASE_16_DOMAIN::from_json(j, x);
    }

}