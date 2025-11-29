// This is
// a multiline
// header.

// GenericUserEntity
export interface GenericUserEntity<T> {
    id: string;
    name: string;
    email: string;
    age?: number;
    metadata: T;
}

// NormalUserMetadata
export interface NormalUserMetadata {
    favoriteColor: string;
    hobbies: string[];
}

export interface NormalUserEntity extends GenericUserEntity<NormalUserMetadata> {}

// AdminUserMetadata
export interface AdminUserMetadata {
    adminLevel: number;
    permissions: string[];
}

export interface AdminUserEntity extends GenericUserEntity<AdminUserMetadata> {}

export type RecordStringAny = Record<string, any>;

// UserEntities
export type UserEntities =
    | NormalUserEntity
    | AdminUserEntity
    | GenericUserEntity<RecordStringAny>;