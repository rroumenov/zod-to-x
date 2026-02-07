// This is
// a multiline
// header.

import * as GENERICS_APP from "./layered_generics.app";

export class HttpSuccessfulResponse<T> {
    success: true;
    data: T;

    constructor(data: HttpSuccessfulResponse<T>) {
        this.success = data.success;
        this.data = data.data;
    }
}

export class HttpUnsuccessfulResponse {
    success: false;
    message: string;
    details?: Record<string, any>;

    constructor(data: HttpUnsuccessfulResponse) {
        this.success = data.success;
        this.message = data.message;
        this.details = data.details;
    }
}

export class HttpErrorResponse {
    message: string;

    constructor(data: HttpErrorResponse) {
        this.message = data.message;
    }
}

export class SomeDtoResult {
    id: string;
    name: string;
    age: number;

    constructor(data: SomeDtoResult) {
        this.id = data.id;
        this.name = data.name;
        this.age = data.age;
    }
}

export class InternalObjectWithGeneric extends HttpSuccessfulResponse<SomeDtoResult> {}

export class ObjectWithGeneric {
    internal: InternalObjectWithGeneric;
    item: HttpSuccessfulResponse<SomeDtoResult>;
    userItem: GENERICS_APP.GenericUserEntity<SomeDtoResult>;
    otherUserItem: GENERICS_APP.AdminUserEntity;

    constructor(data: ObjectWithGeneric) {
        this.internal = data.internal;
        this.item = data.item;
        this.userItem = data.userItem;
        this.otherUserItem = data.otherUserItem;
    }
}

export class OtherDtoResult {
    code: string;
    description: string;

    constructor(data: OtherDtoResult) {
        this.code = data.code;
        this.description = data.description;
    }
}

export class DataRetrieve extends HttpSuccessfulResponse<SomeDtoResult> {}

export type DiscriminantDataRetrieve =
    | HttpSuccessfulResponse<SomeDtoResult>
    | HttpUnsuccessfulResponse;

// Built from intersection of HttpSuccessfulResponse and GenericUserEntity
export class IntersectedDataRetrieve {
    success: true;
    data: SomeDtoResult;
    id: string;
    name: string;
    email: string;
    age?: number;
    metadata: OtherDtoResult;

    constructor(data: IntersectedDataRetrieve) {
        this.success = data.success;
        this.data = data.data;
        this.id = data.id;
        this.name = data.name;
        this.email = data.email;
        this.age = data.age;
        this.metadata = data.metadata;
    }
}

export class UserRetrieve extends HttpSuccessfulResponse<GENERICS_APP.NormalUserEntity> {}