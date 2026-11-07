#pragma once

#include "case_17_domain.hpp"
#include <nlohmann/json.hpp>
#include <stdexcept>

namespace CASE_17_APP {
    enum class Status: int {
        Opened,
        Closed
    };

    struct CreatedEvent : public CASE_17_DOMAIN::Event<CASE_17_DOMAIN::EventKind> {};

    struct OpenedEvent : public CASE_17_DOMAIN::Event<Status> {};

}

namespace CASE_17_APP {
    inline void to_json(nlohmann::json& j, const Status& x) {
        switch (x) {
            case Status::Opened: j = "Opened"; break;
            case Status::Closed: j = "Closed"; break;
            default: throw std::runtime_error("Unexpected value serializing enum Status: " + std::to_string(static_cast<int>(x)));
        }
    }

    inline void from_json(const nlohmann::json& j, Status& x) {
        if (j == "Opened") x = Status::Opened;
        else if (j == "Closed") x = Status::Closed;
        else { throw std::runtime_error("Unexpected value deserializing enum Status."); }
    }

    inline void to_json(nlohmann::json& j, const CreatedEvent& x) {
        CASE_17_DOMAIN::to_json(j, x);
    }

    inline void from_json(const nlohmann::json& j, CreatedEvent& x) {
        CASE_17_DOMAIN::from_json(j, x);
    }

    inline void to_json(nlohmann::json& j, const OpenedEvent& x) {
        CASE_17_DOMAIN::to_json(j, x);
    }

    inline void from_json(const nlohmann::json& j, OpenedEvent& x) {
        CASE_17_DOMAIN::from_json(j, x);
    }

}
