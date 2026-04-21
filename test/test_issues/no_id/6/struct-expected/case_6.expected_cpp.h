#pragma once

#include "case_6_domain.hpp"
#include <nlohmann/json.hpp>

namespace CASE_6_APP {
    template<typename T>
    struct GenericBoxAlias : public CASE_6_DOMAIN::GenericBox<T> {};

    struct ConcreteBoxAlias : public CASE_6_DOMAIN::ConcreteBox {};

}

namespace CASE_6_APP {
    template<typename T>
    inline void to_json(nlohmann::json& j, const GenericBoxAlias<T>& x) {
        CASE_6_DOMAIN::to_json(j, x);
    }

    template<typename T>
    inline void from_json(const nlohmann::json& j, GenericBoxAlias<T>& x) {
        CASE_6_DOMAIN::from_json(j, x);
    }

    inline void to_json(nlohmann::json& j, const ConcreteBoxAlias& x) {
        CASE_6_DOMAIN::to_json(j, x);
    }

    inline void from_json(const nlohmann::json& j, ConcreteBoxAlias& x) {
        CASE_6_DOMAIN::from_json(j, x);
    }

}
