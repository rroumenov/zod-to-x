// This is
// a multiline
// header.

import * as GENERICS_APP from "./layered_generics.app";

export interface HttpSuccessfulResponse<T> {
    success: true;
    data: T;
}

export interface HttpUnsuccessfulResponse {
    success: false;
    message: string;
    details?: Record<string, any>;
}

export interface HttpErrorResponse {
    message: string;
}

export interface SomeDtoResult {
    id: string;
    name: string;
    age: number;
}

export interface InternalObjectWithGeneric extends HttpSuccessfulResponse<SomeDtoResult> {}

export interface ObjectWithGeneric {
    internal: InternalObjectWithGeneric;
    item: HttpSuccessfulResponse<SomeDtoResult>;
    userItem: GENERICS_APP.GenericUserEntity<SomeDtoResult>;
    otherUserItem: GENERICS_APP.AdminUserEntity;
}

export interface OtherDtoResult {
    code: string;
    description: string;
}

export interface DataRetrieve extends HttpSuccessfulResponse<SomeDtoResult> {}

export type DiscriminantDataRetrieve =
    | HttpSuccessfulResponse<SomeDtoResult>
    | HttpUnsuccessfulResponse;

export type IntersectedDataRetrieve = HttpSuccessfulResponse<SomeDtoResult> & GENERICS_APP.GenericUserEntity<OtherDtoResult>;

export interface UserRetrieve extends HttpSuccessfulResponse<GENERICS_APP.NormalUserEntity> {}