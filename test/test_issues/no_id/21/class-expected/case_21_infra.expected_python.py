from typing import TypeAlias
import case_21_app as CASE_21_APP

# Description over a plain alias.
RedefinedPlainAlias: TypeAlias = CASE_21_APP.Inherited

# Description over an alias.
RedefinedDocumentedAlias: TypeAlias = CASE_21_APP.Renamed

PlainOverDocumentedAlias: TypeAlias = CASE_21_APP.Renamed
