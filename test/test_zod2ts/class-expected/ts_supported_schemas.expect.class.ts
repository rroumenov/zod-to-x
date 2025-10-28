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
export class ObjectItem {
    key: string;

    constructor(data: ObjectItem) {
        this.key = data.key;
    }
}

// Another object
export class OtherObjectItem {
    otherKey: string;

    constructor(data: OtherObjectItem) {
        this.otherKey = data.otherKey;
    }
}

// A union of two objects - Built from union of ObjectItem, OtherObjectItem
export class UnionItem {
    key: string;
    otherKey: string;

    constructor(data: UnionItem) {
        this.key = data.key;
        this.otherKey = data.otherKey;
    }
}

// An object with a discriminator
export class ObjectItemWithDiscriminator {
    key: string;
    discriminator: EnumItem.Enum1;

    constructor(data: ObjectItemWithDiscriminator) {
        this.key = data.key;
        this.discriminator = data.discriminator;
    }
}

// Another object with a discriminator
export class OtherObjectItemWithDiscriminator {
    otherKey: string;
    discriminator: EnumItem.Enum2;

    constructor(data: OtherObjectItemWithDiscriminator) {
        this.otherKey = data.otherKey;
        this.discriminator = data.discriminator;
    }
}

// A discriminated union of two objects
export type DiscriminatedUnionItem =
    | ObjectItemWithDiscriminator
    | OtherObjectItemWithDiscriminator;

// An intersection of two objects - Built from intersection of ObjectItem and OtherObjectItem
export class IntersectionItem {
    key: string;
    otherKey: string;

    constructor(data: IntersectionItem) {
        this.key = data.key;
        this.otherKey = data.otherKey;
    }
}

export class TsSupportedSchemas {

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
