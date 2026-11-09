#pragma once

#include "case_15_domain.hpp"
#include <nlohmann/json.hpp>
#include <string>

namespace CASE_15_APP {
    class Price : public CASE_15_DOMAIN::Money {};

    class Invoice {
    private:
        std::string id;
        CASE_15_DOMAIN::Money total;
    
    public:
        Invoice() = default;
        virtual ~Invoice() = default;
        
        const std::string& get_id() const { return this->id; }
        std::string& get_mut_id() { return this->id; }
        void set_id(const std::string& value) { this->id = value; }
        
        const CASE_15_DOMAIN::Money& get_total() const { return this->total; }
        CASE_15_DOMAIN::Money& get_mut_total() { return this->total; }
        void set_total(const CASE_15_DOMAIN::Money& value) { this->total = value; }
    };

}

namespace CASE_15_APP {
    inline void to_json(nlohmann::json& j, const Price& x) {
        CASE_15_DOMAIN::to_json(j, x);
    }

    inline void from_json(const nlohmann::json& j, Price& x) {
        CASE_15_DOMAIN::from_json(j, x);
    }

    inline void to_json(nlohmann::json& j, const Invoice& x) {
        j["id"] = x.get_id();
        j["total"] = x.get_total();
    }

    inline void from_json(const nlohmann::json& j, Invoice& x) {
        x.set_id(j.at("id").get<std::string>());
        x.set_total(j.at("total").get<CASE_15_DOMAIN::Money>());
    }

}