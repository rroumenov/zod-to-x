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
    class Address {
    private:
        std::string street;
        std::string city;
    
    public:
        Address() = default;
        virtual ~Address() = default;
        
        const std::string& get_street() const { return this->street; }
        std::string& get_mut_street() { return this->street; }
        void set_street(const std::string& value) { this->street = value; }
        
        const std::string& get_city() const { return this->city; }
        std::string& get_mut_city() { return this->city; }
        void set_city(const std::string& value) { this->city = value; }
    };

    class Account {
    private:
        std::string id;
        Status status;
        Address address;
    
    public:
        Account() = default;
        virtual ~Account() = default;
        
        const std::string& get_id() const { return this->id; }
        std::string& get_mut_id() { return this->id; }
        void set_id(const std::string& value) { this->id = value; }
        
        const Status& get_status() const { return this->status; }
        Status& get_mut_status() { return this->status; }
        void set_status(const Status& value) { this->status = value; }
        
        const Address& get_address() const { return this->address; }
        Address& get_mut_address() { return this->address; }
        void set_address(const Address& value) { this->address = value; }
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
        j["street"] = x.get_street();
        j["city"] = x.get_city();
    }

    inline void from_json(const nlohmann::json& j, Address& x) {
        x.set_street(j.at("street").get<std::string>());
        x.set_city(j.at("city").get<std::string>());
    }

    inline void to_json(nlohmann::json& j, const Account& x) {
        j["id"] = x.get_id();
        j["status"] = x.get_status();
        j["address"] = x.get_address();
    }

    inline void from_json(const nlohmann::json& j, Account& x) {
        x.set_id(j.at("id").get<std::string>());
        x.set_status(j.at("status").get<Status>());
        x.set_address(j.at("address").get<Address>());
    }

}