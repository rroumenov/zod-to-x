#pragma once

#include "case_16_domain.hpp"
#include <boost/optional.hpp>
#include <nlohmann/json.hpp>
#include <string>
#include <vector>

namespace CASE_16_APP {
    class ShippingAddress : public CASE_16_DOMAIN::Address {};

    class OrderItem : public CASE_16_DOMAIN::Item {};

    using PaymentCurrency = CASE_16_DOMAIN::Currency;

    using RefundCurrency = CASE_16_DOMAIN::Currency;

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

    class Customer : public Contact {};

    class Order {
    private:
        std::string id;
        CASE_16_DOMAIN::Address destination;
        // Billing address
        boost::optional<CASE_16_DOMAIN::Address> billing;
        std::vector<CASE_16_DOMAIN::Item> items;
        CASE_16_DOMAIN::Currency currency;
        Contact contact;
    
    public:
        Order() = default;
        virtual ~Order() = default;
        
        const std::string& get_id() const { return this->id; }
        std::string& get_mut_id() { return this->id; }
        void set_id(const std::string& value) { this->id = value; }
        
        const CASE_16_DOMAIN::Address& get_destination() const { return this->destination; }
        CASE_16_DOMAIN::Address& get_mut_destination() { return this->destination; }
        void set_destination(const CASE_16_DOMAIN::Address& value) { this->destination = value; }
        
        boost::optional<CASE_16_DOMAIN::Address> get_billing() const { return this->billing; }
        void set_billing(boost::optional<CASE_16_DOMAIN::Address> value) { this->billing = value; }
        
        const std::vector<CASE_16_DOMAIN::Item>& get_items() const { return this->items; }
        std::vector<CASE_16_DOMAIN::Item>& get_mut_items() { return this->items; }
        void set_items(const std::vector<CASE_16_DOMAIN::Item>& value) { this->items = value; }
        
        const CASE_16_DOMAIN::Currency& get_currency() const { return this->currency; }
        CASE_16_DOMAIN::Currency& get_mut_currency() { return this->currency; }
        void set_currency(const CASE_16_DOMAIN::Currency& value) { this->currency = value; }
        
        const Contact& get_contact() const { return this->contact; }
        Contact& get_mut_contact() { return this->contact; }
        void set_contact(const Contact& value) { this->contact = value; }
    };

    using AddressList = std::vector<CASE_16_DOMAIN::Address>;

    class OrderItemPage : public CASE_16_DOMAIN::Page<CASE_16_DOMAIN::Item> {};

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
        j["email"] = x.get_email();
    }

    inline void from_json(const nlohmann::json& j, Contact& x) {
        x.set_email(j.at("email").get<std::string>());
    }

    inline void to_json(nlohmann::json& j, const Order& x) {
        j["id"] = x.get_id();
        j["destination"] = x.get_destination();
        CASE_16_APP::set_opt<CASE_16_DOMAIN::Address>(j, "billing", x.get_billing());
        j["items"] = x.get_items();
        j["currency"] = x.get_currency();
        j["contact"] = x.get_contact();
    }

    inline void from_json(const nlohmann::json& j, Order& x) {
        x.set_id(j.at("id").get<std::string>());
        x.set_destination(j.at("destination").get<CASE_16_DOMAIN::Address>());
        x.set_billing(CASE_16_APP::get_opt<CASE_16_DOMAIN::Address>(j, "billing"));
        x.set_items(j.at("items").get<std::vector<CASE_16_DOMAIN::Item>>());
        x.set_currency(j.at("currency").get<CASE_16_DOMAIN::Currency>());
        x.set_contact(j.at("contact").get<Contact>());
    }

    inline void to_json(nlohmann::json& j, const OrderItemPage& x) {
        CASE_16_DOMAIN::to_json(j, x);
    }

    inline void from_json(const nlohmann::json& j, OrderItemPage& x) {
        CASE_16_DOMAIN::from_json(j, x);
    }

}