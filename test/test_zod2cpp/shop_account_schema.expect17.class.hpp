// This is
// a multiline
// header.
#pragma once

#include <string>
#include <stdexcept>
#include <vector>
#include <variant>
#include <cstdint>
#include <unordered_map>
#include <nlohmann/json.hpp>

using nlohmann::json;

namespace zodtocpp {
    class Preferences {
    private:
        std::string theme;
        bool notifications_enabled;
    
    public:
        Preferences() = default;
        virtual ~Preferences() = default;
        
        const std::string& get_theme() const { return this->theme; }
        std::string& get_mut_theme() { return this->theme; }
        void set_theme(const std::string& value) { this->theme = value; }
        
        const bool& get_notifications_enabled() const { return this->notifications_enabled; }
        bool& get_mut_notifications_enabled() { return this->notifications_enabled; }
        void set_notifications_enabled(const bool& value) { this->notifications_enabled = value; }
    };

    // Status enum description
    enum class Status: int {
        Active,
        Inactive,
        Pending
    };

    // Address structure description
    class Address {
    private:
        std::string street;
        
        // City attribute description
        std::string city;
        std::string state;
        std::string zip_code;
    
    public:
        Address() = default;
        virtual ~Address() = default;
        
        const std::string& get_street() const { return this->street; }
        std::string& get_mut_street() { return this->street; }
        void set_street(const std::string& value) { this->street = value; }
        
        const std::string& get_city() const { return this->city; }
        std::string& get_mut_city() { return this->city; }
        void set_city(const std::string& value) { this->city = value; }
        
        const std::string& get_state() const { return this->state; }
        std::string& get_mut_state() { return this->state; }
        void set_state(const std::string& value) { this->state = value; }
        
        const std::string& get_zip_code() const { return this->zip_code; }
        std::string& get_mut_zip_code() { return this->zip_code; }
        void set_zip_code(const std::string& value) { this->zip_code = value; }
    };

    class Order {
    private:
        std::string order_id;
        std::vector<std::string> product_ids;
        double total;
        std::string currency;
        std::string purchased_at;
    
    public:
        Order() = default;
        virtual ~Order() = default;
        
        const std::string& get_order_id() const { return this->order_id; }
        std::string& get_mut_order_id() { return this->order_id; }
        void set_order_id(const std::string& value) { this->order_id = value; }
        
        const std::vector<std::string>& get_product_ids() const { return this->product_ids; }
        std::vector<std::string>& get_mut_product_ids() { return this->product_ids; }
        void set_product_ids(const std::vector<std::string>& value) { this->product_ids = value; }
        
        const double& get_total() const { return this->total; }
        double& get_mut_total() { return this->total; }
        void set_total(const double& value) { this->total = value; }
        
        const std::string& get_currency() const { return this->currency; }
        std::string& get_mut_currency() { return this->currency; }
        void set_currency(const std::string& value) { this->currency = value; }
        
        const std::string& get_purchased_at() const { return this->purchased_at; }
        std::string& get_mut_purchased_at() { return this->purchased_at; }
        void set_purchased_at(const std::string& value) { this->purchased_at = value; }
    };

    class EmailContact {
    private:
        std::string contact_type;
        std::string email;
    
    public:
        EmailContact() = default;
        virtual ~EmailContact() = default;
        
        const std::string& get_contact_type() const { return this->contact_type; }
        std::string& get_mut_contact_type() { return this->contact_type; }
        void set_contact_type(const std::string& value) { this->contact_type = value; }
        
        const std::string& get_email() const { return this->email; }
        std::string& get_mut_email() { return this->email; }
        void set_email(const std::string& value) { this->email = value; }
    };

    class PhoneContact {
    private:
        std::string contact_type;
        std::string phone_number;
    
    public:
        PhoneContact() = default;
        virtual ~PhoneContact() = default;
        
        const std::string& get_contact_type() const { return this->contact_type; }
        std::string& get_mut_contact_type() { return this->contact_type; }
        void set_contact_type(const std::string& value) { this->contact_type = value; }
        
        const std::string& get_phone_number() const { return this->phone_number; }
        std::string& get_mut_phone_number() { return this->phone_number; }
        void set_phone_number(const std::string& value) { this->phone_number = value; }
    };

    class SocialContact {
    private:
        std::string contact_type;
        std::string platform;
        std::string username;
    
    public:
        SocialContact() = default;
        virtual ~SocialContact() = default;
        
        const std::string& get_contact_type() const { return this->contact_type; }
        std::string& get_mut_contact_type() { return this->contact_type; }
        void set_contact_type(const std::string& value) { this->contact_type = value; }
        
        const std::string& get_platform() const { return this->platform; }
        std::string& get_mut_platform() { return this->platform; }
        void set_platform(const std::string& value) { this->platform = value; }
        
        const std::string& get_username() const { return this->username; }
        std::string& get_mut_username() { return this->username; }
        void set_username(const std::string& value) { this->username = value; }
    };

    using ContactInfo = std::variant<EmailContact, PhoneContact, SocialContact>;

    class CreditCard {
    private:
        std::string method_type;
        std::string card_number;
        std::string expiry_date;
    
    public:
        CreditCard() = default;
        virtual ~CreditCard() = default;
        
        const std::string& get_method_type() const { return this->method_type; }
        std::string& get_mut_method_type() { return this->method_type; }
        void set_method_type(const std::string& value) { this->method_type = value; }
        
        const std::string& get_card_number() const { return this->card_number; }
        std::string& get_mut_card_number() { return this->card_number; }
        void set_card_number(const std::string& value) { this->card_number = value; }
        
        const std::string& get_expiry_date() const { return this->expiry_date; }
        std::string& get_mut_expiry_date() { return this->expiry_date; }
        void set_expiry_date(const std::string& value) { this->expiry_date = value; }
    };

    class PayPal {
    private:
        std::string method_type;
        std::string email;
    
    public:
        PayPal() = default;
        virtual ~PayPal() = default;
        
        const std::string& get_method_type() const { return this->method_type; }
        std::string& get_mut_method_type() { return this->method_type; }
        void set_method_type(const std::string& value) { this->method_type = value; }
        
        const std::string& get_email() const { return this->email; }
        std::string& get_mut_email() { return this->email; }
        void set_email(const std::string& value) { this->email = value; }
    };

    class BankTransfer {
    private:
        std::string method_type;
        std::string account_number;
        std::string bank_name;
    
    public:
        BankTransfer() = default;
        virtual ~BankTransfer() = default;
        
        const std::string& get_method_type() const { return this->method_type; }
        std::string& get_mut_method_type() { return this->method_type; }
        void set_method_type(const std::string& value) { this->method_type = value; }
        
        const std::string& get_account_number() const { return this->account_number; }
        std::string& get_mut_account_number() { return this->account_number; }
        void set_account_number(const std::string& value) { this->account_number = value; }
        
        const std::string& get_bank_name() const { return this->bank_name; }
        std::string& get_mut_bank_name() { return this->bank_name; }
        void set_bank_name(const std::string& value) { this->bank_name = value; }
    };

    using PaymentMethod = std::variant<CreditCard, PayPal, BankTransfer>;

    class ShopAccount {
    private:
        std::string id;
        std::string name;
        std::uint64_t age;
        bool is_admin;
        std::string created_at;
        std::vector<double> scores;
        Preferences preferences;
        std::vector<std::string> tags;
        std::unordered_map<std::string, std::string> metadata;
        Status status;
        Address address;
        std::vector<Order> orders;
        ContactInfo contact_info;
        PaymentMethod payment_method;
    
    public:
        ShopAccount() = default;
        virtual ~ShopAccount() = default;
        
        const std::string& get_id() const { return this->id; }
        std::string& get_mut_id() { return this->id; }
        void set_id(const std::string& value) { this->id = value; }
        
        const std::string& get_name() const { return this->name; }
        std::string& get_mut_name() { return this->name; }
        void set_name(const std::string& value) { this->name = value; }
        
        const std::uint64_t& get_age() const { return this->age; }
        std::uint64_t& get_mut_age() { return this->age; }
        void set_age(const std::uint64_t& value) { this->age = value; }
        
        const bool& get_is_admin() const { return this->is_admin; }
        bool& get_mut_is_admin() { return this->is_admin; }
        void set_is_admin(const bool& value) { this->is_admin = value; }
        
        const std::string& get_created_at() const { return this->created_at; }
        std::string& get_mut_created_at() { return this->created_at; }
        void set_created_at(const std::string& value) { this->created_at = value; }
        
        const std::vector<double>& get_scores() const { return this->scores; }
        std::vector<double>& get_mut_scores() { return this->scores; }
        void set_scores(const std::vector<double>& value) { this->scores = value; }
        
        const Preferences& get_preferences() const { return this->preferences; }
        Preferences& get_mut_preferences() { return this->preferences; }
        void set_preferences(const Preferences& value) { this->preferences = value; }
        
        const std::vector<std::string>& get_tags() const { return this->tags; }
        std::vector<std::string>& get_mut_tags() { return this->tags; }
        void set_tags(const std::vector<std::string>& value) { this->tags = value; }
        
        const std::unordered_map<std::string, std::string>& get_metadata() const { return this->metadata; }
        std::unordered_map<std::string, std::string>& get_mut_metadata() { return this->metadata; }
        void set_metadata(const std::unordered_map<std::string, std::string>& value) { this->metadata = value; }
        
        const Status& get_status() const { return this->status; }
        Status& get_mut_status() { return this->status; }
        void set_status(const Status& value) { this->status = value; }
        
        const Address& get_address() const { return this->address; }
        Address& get_mut_address() { return this->address; }
        void set_address(const Address& value) { this->address = value; }
        
        const std::vector<Order>& get_orders() const { return this->orders; }
        std::vector<Order>& get_mut_orders() { return this->orders; }
        void set_orders(const std::vector<Order>& value) { this->orders = value; }
        
        const ContactInfo& get_contact_info() const { return this->contact_info; }
        ContactInfo& get_mut_contact_info() { return this->contact_info; }
        void set_contact_info(const ContactInfo& value) { this->contact_info = value; }
        
        const PaymentMethod& get_payment_method() const { return this->payment_method; }
        PaymentMethod& get_mut_payment_method() { return this->payment_method; }
        void set_payment_method(const PaymentMethod& value) { this->payment_method = value; }
    };

}

namespace zodtocpp {
    inline void to_json(json& j, const Preferences& x) {
        j["theme"] = x.get_theme();
        j["notificationsEnabled"] = x.get_notifications_enabled();
    }

    inline void from_json(const json& j, Preferences& x) {
        x.set_theme(j.at("theme").get<std::string>());
        x.set_notifications_enabled(j.at("notificationsEnabled").get<bool>());
    }

    inline void to_json(json& j, const Status& x) {
        switch (x) {
            case Status::Active: j = "ACTIVE"; break;
            case Status::Inactive: j = "INACTIVE"; break;
            case Status::Pending: j = "PENDING"; break;
            default: throw std::runtime_error("Unexpected value serializing enum Status: " + std::to_string(static_cast<int>(x)));
        }
    }

    inline void from_json(const json& j, Status& x) {
        if (j == "ACTIVE") x = Status::Active;
        else if (j == "INACTIVE") x = Status::Inactive;
        else if (j == "PENDING") x = Status::Pending;
        else { throw std::runtime_error("Unexpected value deserializing enum Status."); }
    }

    inline void to_json(json& j, const Address& x) {
        j["street"] = x.get_street();
        j["city"] = x.get_city();
        j["state"] = x.get_state();
        j["zipCode"] = x.get_zip_code();
    }

    inline void from_json(const json& j, Address& x) {
        x.set_street(j.at("street").get<std::string>());
        x.set_city(j.at("city").get<std::string>());
        x.set_state(j.at("state").get<std::string>());
        x.set_zip_code(j.at("zipCode").get<std::string>());
    }

    inline void to_json(json& j, const Order& x) {
        j["orderId"] = x.get_order_id();
        j["productIds"] = x.get_product_ids();
        j["total"] = x.get_total();
        j["currency"] = x.get_currency();
        j["purchasedAt"] = x.get_purchased_at();
    }

    inline void from_json(const json& j, Order& x) {
        x.set_order_id(j.at("orderId").get<std::string>());
        x.set_product_ids(j.at("productIds").get<std::vector<std::string>>());
        x.set_total(j.at("total").get<double>());
        x.set_currency(j.at("currency").get<std::string>());
        x.set_purchased_at(j.at("purchasedAt").get<std::string>());
    }

    inline void to_json(json& j, const EmailContact& x) {
        j["contactType"] = x.get_contact_type();
        j["email"] = x.get_email();
    }

    inline void from_json(const json& j, EmailContact& x) {
        x.set_contact_type(j.at("contactType").get<std::string>());
        x.set_email(j.at("email").get<std::string>());
    }

    inline void to_json(json& j, const PhoneContact& x) {
        j["contactType"] = x.get_contact_type();
        j["phoneNumber"] = x.get_phone_number();
    }

    inline void from_json(const json& j, PhoneContact& x) {
        x.set_contact_type(j.at("contactType").get<std::string>());
        x.set_phone_number(j.at("phoneNumber").get<std::string>());
    }

    inline void to_json(json& j, const SocialContact& x) {
        j["contactType"] = x.get_contact_type();
        j["platform"] = x.get_platform();
        j["username"] = x.get_username();
    }

    inline void from_json(const json& j, SocialContact& x) {
        x.set_contact_type(j.at("contactType").get<std::string>());
        x.set_platform(j.at("platform").get<std::string>());
        x.set_username(j.at("username").get<std::string>());
    }

    inline void to_json(json& j, const ContactInfo& x) {
        std::visit(
            [&j](auto&& arg) {
                using T = std::decay_t<decltype(arg)>;
                if constexpr (std::is_same_v<T, EmailContact>) {
                    j = arg;
                }
                else if constexpr (std::is_same_v<T, PhoneContact>) {
                    j = arg;
                }
                else if constexpr (std::is_same_v<T, SocialContact>) {
                    j = arg;
                }
                else {
                    throw std::runtime_error("Unknown ContactInfo type.");
                }
            },
            x
        );
    }

    inline void from_json(const json& j, ContactInfo& x) {
        try {
            // Try to deserialize as EmailContact
            x = j.get<EmailContact>();
            return;
        } catch (const std::exception&) {
            // Fall through to try the next type
        }
        try {
            // Try to deserialize as PhoneContact
            x = j.get<PhoneContact>();
            return;
        } catch (const std::exception&) {
            // Fall through to try the next type
        }
        try {
            // Try to deserialize as SocialContact
            x = j.get<SocialContact>();
            return;
        } catch (const std::exception&) {
            // None of the types matched. Error
            throw std::runtime_error("Failed to deserialize ContactInfo: unknown format");
        }
    }

    inline void to_json(json& j, const CreditCard& x) {
        j["methodType"] = x.get_method_type();
        j["cardNumber"] = x.get_card_number();
        j["expiryDate"] = x.get_expiry_date();
    }

    inline void from_json(const json& j, CreditCard& x) {
        x.set_method_type(j.at("methodType").get<std::string>());
        x.set_card_number(j.at("cardNumber").get<std::string>());
        x.set_expiry_date(j.at("expiryDate").get<std::string>());
    }

    inline void to_json(json& j, const PayPal& x) {
        j["methodType"] = x.get_method_type();
        j["email"] = x.get_email();
    }

    inline void from_json(const json& j, PayPal& x) {
        x.set_method_type(j.at("methodType").get<std::string>());
        x.set_email(j.at("email").get<std::string>());
    }

    inline void to_json(json& j, const BankTransfer& x) {
        j["methodType"] = x.get_method_type();
        j["accountNumber"] = x.get_account_number();
        j["bankName"] = x.get_bank_name();
    }

    inline void from_json(const json& j, BankTransfer& x) {
        x.set_method_type(j.at("methodType").get<std::string>());
        x.set_account_number(j.at("accountNumber").get<std::string>());
        x.set_bank_name(j.at("bankName").get<std::string>());
    }

    inline void to_json(json& j, const PaymentMethod& x) {
        std::visit(
            [&j](auto&& arg) {
                using T = std::decay_t<decltype(arg)>;
                if constexpr (std::is_same_v<T, CreditCard>) {
                    j = arg;
                }
                else if constexpr (std::is_same_v<T, PayPal>) {
                    j = arg;
                }
                else if constexpr (std::is_same_v<T, BankTransfer>) {
                    j = arg;
                }
                else {
                    throw std::runtime_error("Unknown PaymentMethod type.");
                }
            },
            x
        );
    }

    inline void from_json(const json& j, PaymentMethod& x) {
        const auto& k = j.at("methodType").get<std::string>();
        if (k == "creditCard") {
            x = j.get<CreditCard>();
        }
        else if (k == "paypal") {
            x = j.get<PayPal>();
        }
        else if (k == "bankTransfer") {
            x = j.get<BankTransfer>();
        }
        else {
            // None of the types matched. Error
            throw std::runtime_error("Failed to deserialize PaymentMethod: unknown format");
        }
    }

    inline void to_json(json& j, const ShopAccount& x) {
        j["id"] = x.get_id();
        j["name"] = x.get_name();
        j["age"] = x.get_age();
        j["isAdmin"] = x.get_is_admin();
        j["createdAt"] = x.get_created_at();
        j["scores"] = x.get_scores();
        j["preferences"] = x.get_preferences();
        j["tags"] = x.get_tags();
        j["metadata"] = x.get_metadata();
        j["status"] = x.get_status();
        j["address"] = x.get_address();
        j["orders"] = x.get_orders();
        j["contactInfo"] = x.get_contact_info();
        j["paymentMethod"] = x.get_payment_method();
    }

    inline void from_json(const json& j, ShopAccount& x) {
        x.set_id(j.at("id").get<std::string>());
        x.set_name(j.at("name").get<std::string>());
        x.set_age(j.at("age").get<std::uint64_t>());
        x.set_is_admin(j.at("isAdmin").get<bool>());
        x.set_created_at(j.at("createdAt").get<std::string>());
        x.set_scores(j.at("scores").get<std::vector<double>>());
        x.set_preferences(j.at("preferences").get<Preferences>());
        x.set_tags(j.at("tags").get<std::vector<std::string>>());
        x.set_metadata(j.at("metadata").get<std::unordered_map<std::string, std::string>>());
        x.set_status(j.at("status").get<Status>());
        x.set_address(j.at("address").get<Address>());
        x.set_orders(j.at("orders").get<std::vector<Order>>());
        x.set_contact_info(j.at("contactInfo").get<ContactInfo>());
        x.set_payment_method(j.at("paymentMethod").get<PaymentMethod>());
    }

}