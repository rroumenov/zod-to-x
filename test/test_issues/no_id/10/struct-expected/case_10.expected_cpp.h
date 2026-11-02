#pragma once

#include <nlohmann/json.hpp>
#include <stdexcept>
#include <string>

namespace CASE_10_DOMAIN {
    // Account status
    enum class Status: int {
        Active,
        Inactive
    };

    // Postal address
    struct Address {
        std::string street;
        std::string city;
    };

    struct Account {
        std::string id;
        Status status;
        Address address;
    };

}

namespace CASE_10_DOMAIN {
    inline void to_json(nlohmann::json& j, const Status& x) {
        switch (x) {
            case Status::Active: j = "Active"; break;
            case Status::Inactive: j = "Inactive"; break;
            default: throw std::runtime_error("Unexpected value serializing enum Status: " + std::to_string(static_cast<int>(x)));
        }
    }

    inline void from_json(const nlohmann::json& j, Status& x) {
        if (j == "Active") x = Status::Active;
        else if (j == "Inactive") x = Status::Inactive;
        else { throw std::runtime_error("Unexpected value deserializing enum Status."); }
    }

    inline void to_json(nlohmann::json& j, const Address& x) {
        j["street"] = x.street;
        j["city"] = x.city;
    }

    inline void from_json(const nlohmann::json& j, Address& x) {
        x.street = j.at("street").get<std::string>();
        x.city = j.at("city").get<std::string>();
    }

    inline void to_json(nlohmann::json& j, const Account& x) {
        j["id"] = x.id;
        j["status"] = x.status;
        j["address"] = x.address;
    }

    inline void from_json(const nlohmann::json& j, Account& x) {
        x.id = j.at("id").get<std::string>();
        x.status = j.at("status").get<Status>();
        x.address = j.at("address").get<Address>();
    }

}