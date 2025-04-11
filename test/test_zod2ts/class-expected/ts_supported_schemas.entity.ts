// This is
// a multiline
// header.

export enum EnumItem {
    Enum1 = "Enum1",
    Enum2 = "Enum2",
    Enum3 = "Enum3",
}

export enum NativeEnumItem {
    NativeEnum1 = 1,
    NativeEnum2 = 2,
    NativeEnum3 = "NativeEnum3",
}

export class ObjectItem {
    key: string;

    constructor(data: ObjectItem) {
        this.key = data.key;
    }
}

export class OtherObjectItem {
    otherKey: string;

    constructor(data: OtherObjectItem) {
        this.otherKey = data.otherKey;
    }
}

export class ObjectItemWithDiscriminator {
    key: string;
    discriminator: EnumItem.Enum1;

    constructor(data: ObjectItemWithDiscriminator) {
        this.key = data.key;
        this.discriminator = data.discriminator;
    }
}

export class OtherObjectItemWithDiscriminator {
    otherKey: string;
    discriminator: EnumItem.Enum2;

    constructor(data: OtherObjectItemWithDiscriminator) {
        this.otherKey = data.otherKey;
        this.discriminator = data.discriminator;
    }
}

// Built from union of ObjectItem, OtherObjectItem
export class UnionItem {
    key: string;
    otherKey: string;

    constructor(data: UnionItem) {
        this.key = data.key;
        this.otherKey = data.otherKey;
    }
}

export type DiscriminatedUnionItem = ObjectItemWithDiscriminator | OtherObjectItemWithDiscriminator;

// Built from intersection of ObjectItem and OtherObjectItem
export class IntersectionItem {
    key: string;
    otherKey: string;

    constructor(data: IntersectionItem) {
        this.key = data.key;
        this.otherKey = data.otherKey;
    }
}

export class TsSupportedSchemas {
    stringItem: string;
    literalStringItem: "literal";
    literalNumberItem: 1;
    enumItem: EnumItem;
    nativeEnumItem: NativeEnumItem;
    doubleItem: number;
    bigIntItem: number;
    int64Item: number;
    int32Item: number;
    booleanItem: boolean;
    objectItem: ObjectItem;
    otherObjectItem: OtherObjectItem;
    objectItemWithDiscriminator: ObjectItemWithDiscriminator;
    otherObjectItemWithDiscriminator: OtherObjectItemWithDiscriminator;
    dateItem: Date;
    arrayItem: Array<number[]>;
    recordItem: Record<string, number>;
    mapItem: Map<string, number>;
    setItem: Set<string>;
    tupleItem: [number, string, boolean];
    unionItem: UnionItem;
    discriminatedUnionItem: DiscriminatedUnionItem;
    intersectionItem: IntersectionItem;
    anyItem: any;
    optionalItem?: string;
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
