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
    class ShippingAddress : public CASE_21_DOMAIN::Address {};

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

    class Order {
    private:
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
    
    public:
        Order() = default;
        virtual ~Order() = default;
        
        const CASE_21_DOMAIN::Documented& get_redefined() const { return this->redefined; }
        CASE_21_DOMAIN::Documented& get_mut_redefined() { return this->redefined; }
        void set_redefined(const CASE_21_DOMAIN::Documented& value) { this->redefined = value; }
        
        const CASE_21_DOMAIN::Documented& get_restated() const { return this->restated; }
        CASE_21_DOMAIN::Documented& get_mut_restated() { return this->restated; }
        void set_restated(const CASE_21_DOMAIN::Documented& value) { this->restated = value; }
        
        const CASE_21_DOMAIN::Uuid& get_documented() const { return this->documented; }
        CASE_21_DOMAIN::Uuid& get_mut_documented() { return this->documented; }
        void set_documented(const CASE_21_DOMAIN::Uuid& value) { this->documented = value; }
        
        boost::optional<CASE_21_DOMAIN::Uuid> get_described_before() const { return this->described_before; }
        void set_described_before(boost::optional<CASE_21_DOMAIN::Uuid> value) { this->described_before = value; }
        
        boost::optional<CASE_21_DOMAIN::Uuid> get_described_after() const { return this->described_after; }
        void set_described_after(boost::optional<CASE_21_DOMAIN::Uuid> value) { this->described_after = value; }
        
        const std::vector<CASE_21_DOMAIN::Uuid>& get_list() const { return this->list; }
        std::vector<CASE_21_DOMAIN::Uuid>& get_mut_list() { return this->list; }
        void set_list(const std::vector<CASE_21_DOMAIN::Uuid>& value) { this->list = value; }
        
        const CASE_21_DOMAIN::Address& get_address() const { return this->address; }
        CASE_21_DOMAIN::Address& get_mut_address() { return this->address; }
        void set_address(const CASE_21_DOMAIN::Address& value) { this->address = value; }
        
        const CASE_21_DOMAIN::Currency& get_currency() const { return this->currency; }
        CASE_21_DOMAIN::Currency& get_mut_currency() { return this->currency; }
        void set_currency(const CASE_21_DOMAIN::Currency& value) { this->currency = value; }
        
        const std::string& get_local() const { return this->local; }
        std::string& get_mut_local() { return this->local; }
        void set_local(const std::string& value) { this->local = value; }
        
        const CASE_21_DOMAIN::Documented& get_plain() const { return this->plain; }
        CASE_21_DOMAIN::Documented& get_mut_plain() { return this->plain; }
        void set_plain(const CASE_21_DOMAIN::Documented& value) { this->plain = value; }
        
        boost::optional<CASE_21_DOMAIN::Documented> get_plain_optional() const { return this->plain_optional; }
        void set_plain_optional(boost::optional<CASE_21_DOMAIN::Documented> value) { this->plain_optional = value; }
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
        j["email"] = x.get_email();
    }

    inline void from_json(const nlohmann::json& j, Contact& x) {
        x.set_email(j.at("email").get<std::string>());
    }

    inline void to_json(nlohmann::json& j, const Order& x) {
        j["redefined"] = x.get_redefined();
        j["restated"] = x.get_restated();
        j["documented"] = x.get_documented();
        CASE_21_APP::set_opt<CASE_21_DOMAIN::Uuid>(j, "describedBefore", x.get_described_before());
        CASE_21_APP::set_opt<CASE_21_DOMAIN::Uuid>(j, "describedAfter", x.get_described_after());
        j["list"] = x.get_list();
        j["address"] = x.get_address();
        j["currency"] = x.get_currency();
        j["local"] = x.get_local();
        j["plain"] = x.get_plain();
        CASE_21_APP::set_opt<CASE_21_DOMAIN::Documented>(j, "plainOptional", x.get_plain_optional());
    }

    inline void from_json(const nlohmann::json& j, Order& x) {
        x.set_redefined(j.at("redefined").get<CASE_21_DOMAIN::Documented>());
        x.set_restated(j.at("restated").get<CASE_21_DOMAIN::Documented>());
        x.set_documented(j.at("documented").get<CASE_21_DOMAIN::Uuid>());
        x.set_described_before(CASE_21_APP::get_opt<CASE_21_DOMAIN::Uuid>(j, "describedBefore"));
        x.set_described_after(CASE_21_APP::get_opt<CASE_21_DOMAIN::Uuid>(j, "describedAfter"));
        x.set_list(j.at("list").get<std::vector<CASE_21_DOMAIN::Uuid>>());
        x.set_address(j.at("address").get<CASE_21_DOMAIN::Address>());
        x.set_currency(j.at("currency").get<CASE_21_DOMAIN::Currency>());
        x.set_local(j.at("local").get<std::string>());
        x.set_plain(j.at("plain").get<CASE_21_DOMAIN::Documented>());
        x.set_plain_optional(CASE_21_APP::get_opt<CASE_21_DOMAIN::Documented>(j, "plainOptional"));
    }

}