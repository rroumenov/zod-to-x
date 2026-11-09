import * as CASE_21_APP from "./case_21_app";

// Description over a plain alias.
export type RedefinedPlainAlias = CASE_21_APP.Inherited;

// Description over an alias.
export type RedefinedDocumentedAlias = CASE_21_APP.Renamed;

export type PlainOverDocumentedAlias = CASE_21_APP.Renamed;
