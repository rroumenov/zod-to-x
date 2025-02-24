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

export interface ObjectItem {
    key: string;
}

export interface OtherObjectItem {
    otherKey: string;
}

export type UnionItem = ObjectItem | OtherObjectItem;

export interface ObjectItemWithDiscriminator {
    key: string;
    discriminator: EnumItem.Enum1;
}

export interface OtherObjectItemWithDiscriminator {
    otherKey: string;
    discriminator: EnumItem.Enum2;
}

export type DiscriminantUnionItem = ObjectItemWithDiscriminator | OtherObjectItemWithDiscriminator;

export type IntersectionItem = ObjectItem & OtherObjectItem;

export interface TsSupportedSchemas {
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
    dateItem: Date;
    arrayItem: Array<number[]>;
    recordItem: Record<string, number>;
    mapItem: Map<string, number>;
    setItem: Set<string>;
    tupleItem: [number, string, boolean];
    unionItem: UnionItem;
    discriminatedUnionItem: DiscriminantUnionItem;
    intersectionItem: IntersectionItem;
    anyItem: any;
    optionalItem?: string;
    nullableItem: string | null;
}