#pragma once

#include "case_21_app.hpp"

namespace CASE_21_INFRA {
    // Description over a plain alias.
    using RedefinedPlainAlias = CASE_21_APP::Inherited;

    // Description over an alias.
    using RedefinedDocumentedAlias = CASE_21_APP::Renamed;

    using PlainOverDocumentedAlias = CASE_21_APP::Renamed;

}