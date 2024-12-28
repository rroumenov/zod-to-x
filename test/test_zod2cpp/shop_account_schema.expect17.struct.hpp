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
    struct Preferences {
        std::string theme;
        bool notifications_enabled;
    };

    // Status enum description
    enum class Status: int {
        Active,
        Inactive,
        Pending
    };

    // Address structure description
    struct Address {
        std::string street;
        
        // City attribute description
        std::string city;
        std::string state;
        std::string zip_code;
    };

    struct Order {
        std::string order_id;
        std::vector<std::string> product_ids;
        double total;
        std::string currency;
        std::string purchased_at;
    };

    struct EmailContact {
        std::string contact_type;
        std::string email;
    };

    struct PhoneContact {
        std::string contact_type;
        std::string phone_number;
    };

    struct SocialContact {
        std::string contact_type;
        std::string platform;
        std::string username;
    };

    using ContactInfo = std::variant<EmailContact, PhoneContact, SocialContact>;

    struct CreditCard {
        std::string method_type;
        std::string card_number;
        std::string expiry_date;
    };

    struct PayPal {
        std::string method_type;
        std::string email;
    };

    struct BankTransfer {
        std::string method_type;
        std::string account_number;
        std::string bank_name;
    };

    using PaymentMethod = std::variant<CreditCard, PayPal, BankTransfer>;

    struct ShopAccount {
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
    };

}

namespace zodtocpp {
    inline void to_json(json& j, const Preferences& x) {
        j["theme"] = x.theme;
        j["notificationsEnabled"] = x.notifications_enabled;
    }

    inline void from_json(const json& j, Preferences& x) {
        x.theme = j.at("theme").get<std::string>();
        x.notifications_enabled = j.at("notificationsEnabled").get<bool>();
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
        j["street"] = x.street;
        j["city"] = x.city;
        j["state"] = x.state;
        j["zipCode"] = x.zip_code;
    }

    inline void from_json(const json& j, Address& x) {
        x.street = j.at("street").get<std::string>();
        x.city = j.at("city").get<std::string>();
        x.state = j.at("state").get<std::string>();
        x.zip_code = j.at("zipCode").get<std::string>();
    }

    inline void to_json(json& j, const Order& x) {
        j["orderId"] = x.order_id;
        j["productIds"] = x.product_ids;
        j["total"] = x.total;
        j["currency"] = x.currency;
        j["purchasedAt"] = x.purchased_at;
    }

    inline void from_json(const json& j, Order& x) {
        x.order_id = j.at("orderId").get<std::string>();
        x.product_ids = j.at("productIds").get<std::vector<std::string>>();
        x.total = j.at("total").get<double>();
        x.currency = j.at("currency").get<std::string>();
        x.purchased_at = j.at("purchasedAt").get<std::string>();
    }

    inline void to_json(json& j, const EmailContact& x) {
        j["contactType"] = x.contact_type;
        j["email"] = x.email;
    }

    inline void from_json(const json& j, EmailContact& x) {
        x.contact_type = j.at("contactType").get<std::string>();
        x.email = j.at("email").get<std::string>();
    }

    inline void to_json(json& j, const PhoneContact& x) {
        j["contactType"] = x.contact_type;
        j["phoneNumber"] = x.phone_number;
    }

    inline void from_json(const json& j, PhoneContact& x) {
        x.contact_type = j.at("contactType").get<std::string>();
        x.phone_number = j.at("phoneNumber").get<std::string>();
    }

    inline void to_json(json& j, const SocialContact& x) {
        j["contactType"] = x.contact_type;
        j["platform"] = x.platform;
        j["username"] = x.username;
    }

    inline void from_json(const json& j, SocialContact& x) {
        x.contact_type = j.at("contactType").get<std::string>();
        x.platform = j.at("platform").get<std::string>();
        x.username = j.at("username").get<std::string>();
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
        j["methodType"] = x.method_type;
        j["cardNumber"] = x.card_number;
        j["expiryDate"] = x.expiry_date;
    }

    inline void from_json(const json& j, CreditCard& x) {
        x.method_type = j.at("methodType").get<std::string>();
        x.card_number = j.at("cardNumber").get<std::string>();
        x.expiry_date = j.at("expiryDate").get<std::string>();
    }

    inline void to_json(json& j, const PayPal& x) {
        j["methodType"] = x.method_type;
        j["email"] = x.email;
    }

    inline void from_json(const json& j, PayPal& x) {
        x.method_type = j.at("methodType").get<std::string>();
        x.email = j.at("email").get<std::string>();
    }

    inline void to_json(json& j, const BankTransfer& x) {
        j["methodType"] = x.method_type;
        j["accountNumber"] = x.account_number;
        j["bankName"] = x.bank_name;
    }

    inline void from_json(const json& j, BankTransfer& x) {
        x.method_type = j.at("methodType").get<std::string>();
        x.account_number = j.at("accountNumber").get<std::string>();
        x.bank_name = j.at("bankName").get<std::string>();
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
        j["id"] = x.id;
        j["name"] = x.name;
        j["age"] = x.age;
        j["isAdmin"] = x.is_admin;
        j["createdAt"] = x.created_at;
        j["scores"] = x.scores;
        j["preferences"] = x.preferences;
        j["tags"] = x.tags;
        j["metadata"] = x.metadata;
        j["status"] = x.status;
        j["address"] = x.address;
        j["orders"] = x.orders;
        j["contactInfo"] = x.contact_info;
        j["paymentMethod"] = x.payment_method;
    }

    inline void from_json(const json& j, ShopAccount& x) {
        x.id = j.at("id").get<std::string>();
        x.name = j.at("name").get<std::string>();
        x.age = j.at("age").get<std::uint64_t>();
        x.is_admin = j.at("isAdmin").get<bool>();
        x.created_at = j.at("createdAt").get<std::string>();
        x.scores = j.at("scores").get<std::vector<double>>();
        x.preferences = j.at("preferences").get<Preferences>();
        x.tags = j.at("tags").get<std::vector<std::string>>();
        x.metadata = j.at("metadata").get<std::unordered_map<std::string, std::string>>();
        x.status = j.at("status").get<Status>();
        x.address = j.at("address").get<Address>();
        x.orders = j.at("orders").get<std::vector<Order>>();
        x.contact_info = j.at("contactInfo").get<ContactInfo>();
        x.payment_method = j.at("paymentMethod").get<PaymentMethod>();
    }

}