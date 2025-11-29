// This is
// a multiline
// header.

// GenericUserEntity
export class GenericUserEntity<T> {
    id: string;
    name: string;
    email: string;
    age?: number;
    metadata: T;

    constructor(data: GenericUserEntity<T>) {
        this.id = data.id;
        this.name = data.name;
        this.email = data.email;
        this.age = data.age;
        this.metadata = data.metadata;
    }
}

// NormalUserMetadata
export class NormalUserMetadata {
    favoriteColor: string;
    hobbies: string[];

    constructor(data: NormalUserMetadata) {
        this.favoriteColor = data.favoriteColor;
        this.hobbies = data.hobbies;
    }
}

export class NormalUserEntity extends GenericUserEntity<NormalUserMetadata> {}

// AdminUserMetadata
export class AdminUserMetadata {
    adminLevel: number;
    permissions: string[];

    constructor(data: AdminUserMetadata) {
        this.adminLevel = data.adminLevel;
        this.permissions = data.permissions;
    }
}

export class AdminUserEntity extends GenericUserEntity<AdminUserMetadata> {}

export type RecordStringAny = Record<string, any>;

// UserEntities
export type UserEntities =
    | NormalUserEntity
    | AdminUserEntity
    | GenericUserEntity<RecordStringAny>;