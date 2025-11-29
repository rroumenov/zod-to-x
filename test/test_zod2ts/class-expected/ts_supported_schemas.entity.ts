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
export class ObjectItem {
    key: string;

    constructor(data: ObjectItem) {
        this.key = data.key;
    }
}

// Other Object Item
export class OtherObjectItem {
    otherKey: string;

    constructor(data: OtherObjectItem) {
        this.otherKey = data.otherKey;
    }
}

// Object Item With Discriminator
export class ObjectItemWithDiscriminator {
    key: string;
    discriminator: EnumItem.Enum1;

    constructor(data: ObjectItemWithDiscriminator) {
        this.key = data.key;
        this.discriminator = data.discriminator;
    }
}

// Other Object Item With Discriminator
export class OtherObjectItemWithDiscriminator {
    otherKey: string;
    discriminator: EnumItem.Enum2;

    constructor(data: OtherObjectItemWithDiscriminator) {
        this.otherKey = data.otherKey;
        this.discriminator = data.discriminator;
    }
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

// Union Item - Built from union of ObjectItem, OtherObjectItem
export class UnionItem {
    key: string;
    otherKey: string;

    constructor(data: UnionItem) {
        this.key = data.key;
        this.otherKey = data.otherKey;
    }
}

// Discriminated Union Item
export type DiscriminatedUnionItem =
    | ObjectItemWithDiscriminator
    | OtherObjectItemWithDiscriminator;

// Intersection Item - Built from intersection of ObjectItem and OtherObjectItem
export class IntersectionItem {
    key: string;
    otherKey: string;

    constructor(data: IntersectionItem) {
        this.key = data.key;
        this.otherKey = data.otherKey;
    }
}

// Any type
export type AnyItem = any;

export class TsSupportedSchemas {
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

    constructor(data: TsSupportedSchemas) {
        this.stringItem = data.stringItem;
        this.literalStringItem = data.literalStringItem;
        this.literalNumberItem = data.literalNumberItem;
        this.enumItem = data.enumItem;
        this.nativeEnumItem = data.nativeEnumItem;
        this.doubleItem = data.doubleItem;
        this.bigIntItem = data.bigIntItem;
        this.int64Item = data.int64Item;
        this.int32Item = data.int32Item;
        this.booleanItem = data.booleanItem;
        this.objectItem = data.objectItem;
        this.otherObjectItem = data.otherObjectItem;
        this.objectItemWithDiscriminator = data.objectItemWithDiscriminator;
        this.otherObjectItemWithDiscriminator = data.otherObjectItemWithDiscriminator;
        this.dateItem = data.dateItem;
        this.arrayItem = data.arrayItem;
        this.recordItem = data.recordItem;
        this.mapItem = data.mapItem;
        this.setItem = data.setItem;
        this.tupleItem = data.tupleItem;
        this.unionItem = data.unionItem;
        this.discriminatedUnionItem = data.discriminatedUnionItem;
        this.intersectionItem = data.intersectionItem;
        this.anyItem = data.anyItem;
        this.optionalItem = data.optionalItem;
        this.nullableItem = data.nullableItem;
    }
}
