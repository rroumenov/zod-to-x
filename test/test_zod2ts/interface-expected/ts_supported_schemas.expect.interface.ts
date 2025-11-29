// This is
// a multiline
// header.

// An enum
export enum EnumItem {
    Enum1 = "Enum1",
    Enum2 = "Enum2",
    Enum3 = "Enum3",
}

// A native enum
export enum NativeEnumItem {
    NativeEnum1 = 1,
    NativeEnum2 = 2,
    NativeEnum3 = "NativeEnum3",
}

// An object
export interface ObjectItem {
    key: string;
}

// Another object
export interface OtherObjectItem {
    otherKey: string;
}

// A union of two objects
export type UnionItem =
    | ObjectItem
    | OtherObjectItem;

// An object with a discriminator
export interface ObjectItemWithDiscriminator {
    key: string;
    discriminator: EnumItem.Enum1;
}

// Another object with a discriminator
export interface OtherObjectItemWithDiscriminator {
    otherKey: string;
    discriminator: EnumItem.Enum2;
}

// A discriminated union of two objects
export type DiscriminatedUnionItem =
    | ObjectItemWithDiscriminator
    | OtherObjectItemWithDiscriminator;

// An intersection of two objects
export type IntersectionItem = ObjectItem & OtherObjectItem;

export interface TsSupportedSchemas {

    // A simple string
    stringItem: string;

    // A literal string
    literalStringItem: "literal";

    // A literal number
    literalNumberItem: 1;
    enumItem: EnumItem;
    nativeEnumItem: NativeEnumItem;

    // A double
    doubleItem: number;

    // A big integer
    bigIntItem: number;

    // A 64-bit integer
    int64Item: number;

    // A 32-bit integer
    int32Item: number;

    // A boolean
    booleanItem: boolean;
    objectItem: ObjectItem;

    // A date
    dateItem: Date;

    // A two-dimensional array of numbers
    arrayItem: Array<number[]>;

    // A record with string keys and number values
    recordItem: Record<string, number>;

    // A map with string keys and number values
    mapItem: Map<string, number>;

    // A set of strings
    setItem: Set<string>;

    // A tuple of a number, a string, and a boolean
    tupleItem: [number, string, boolean];
    unionItem: UnionItem;
    discriminatedUnionItem: DiscriminatedUnionItem;
    intersectionItem: IntersectionItem;

    // Any type
    anyItem: any;

    // An optional string
    optionalItem?: string;

    // A nullable string
    nullableItem: string | null;
}