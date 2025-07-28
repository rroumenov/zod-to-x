// This is
// a multiline
// header.

export type StringItem = string;

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

export type DoubleItem = number;

export type BigIntItem = number;

export type Int64Item = number;

export type Int32Item = number;

export type BooleanItem = boolean;

export interface ObjectItem {
    key: string;
}

export interface OtherObjectItem {
    otherKey: string;
}

export interface ObjectItemWithDiscriminator {
    key: string;
    discriminator: EnumItem.Enum1;
}

export interface OtherObjectItemWithDiscriminator {
    otherKey: string;
    discriminator: EnumItem.Enum2;
}

export type DateItem = Date;

export type ArrayItem = Array<number[]>;

export type RecordItem = Record<string, number>;

export type MapItem = Map<string, number>;

export type SetItem = Set<string>;

export type TupleItem = [number, string, boolean];

export type UnionItem =
    | ObjectItem
    | OtherObjectItem;

export type DiscriminatedUnionItem =
    | ObjectItemWithDiscriminator
    | OtherObjectItemWithDiscriminator;

export type IntersectionItem = ObjectItem & OtherObjectItem;

export type AnyItem = any;

export interface TsSupportedSchemas {
    stringItem: StringItem;
    literalStringItem: "literal";
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
    optionalItem?: string;
    nullableItem: string | null;
}
