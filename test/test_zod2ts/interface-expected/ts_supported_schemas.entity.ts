// This is
// a multiline
// header.

// A simple string
export type StringItem = string;

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

// A double
export type DoubleItem = number;

// A big integer
export type BigIntItem = number;

// A 64-bit integer
export type Int64Item = number;

// A 32-bit integer
export type Int32Item = number;

// A boolean
export type BooleanItem = boolean;

// An object
export interface ObjectItem {
    key: string;
}

// Other Object Item
export interface OtherObjectItem {
    otherKey: string;
}

// Object Item With Discriminator
export interface ObjectItemWithDiscriminator {
    key: string;
    discriminator: EnumItem.Enum1;
}

// Other Object Item With Discriminator
export interface OtherObjectItemWithDiscriminator {
    otherKey: string;
    discriminator: EnumItem.Enum2;
}

// A date
export type DateItem = Date;

// A two-dimensional array of numbers
export type ArrayItem = Array<number[]>;

// A record with string keys and number values
export type RecordItem = Record<string, number>;

// A map with string keys and number values
export type MapItem = Map<string, number>;

// A set of strings
export type SetItem = Set<string>;

// A tuple of a number, a string, and a boolean
export type TupleItem = [number, string, boolean];

// Union Item
export type UnionItem =
    | ObjectItem
    | OtherObjectItem;

// Discriminated Union Item
export type DiscriminatedUnionItem =
    | ObjectItemWithDiscriminator
    | OtherObjectItemWithDiscriminator;

// Intersection Item
export type IntersectionItem = ObjectItem & OtherObjectItem;

// Any type
export type AnyItem = any;

export interface TsSupportedSchemas {
    stringItem: StringItem;

    // A literal string
    literalStringItem: "literal";

    // A literal number
    literalNumberItem: 1;
    enumItem: EnumItem;
    nativeEnumItem: NativeEnumItem;
    doubleItem: DoubleItem;
    bigIntItem: BigIntItem;
    int64Item: Int64Item;
    int32Item: Int32Item;
    booleanItem: BooleanItem;
    objectItem: ObjectItem;
    otherObjectItem: OtherObjectItem;
    objectItemWithDiscriminator: ObjectItemWithDiscriminator;
    otherObjectItemWithDiscriminator: OtherObjectItemWithDiscriminator;
    dateItem: DateItem;
    arrayItem: ArrayItem;
    recordItem: RecordItem;
    mapItem: MapItem;
    setItem: SetItem;
    tupleItem: TupleItem;
    unionItem: UnionItem;
    discriminatedUnionItem: DiscriminatedUnionItem;
    intersectionItem: IntersectionItem;
    anyItem: AnyItem;

    // An optional string
    optionalItem?: string;

    // A nullable string
    nullableItem: string | null;
}
