// This is
// a multiline
// header.
export enum MyEnumType {
    Item1 = "Item1",
    Item2 = "Item2",
}

export enum MyNativeEnumType {
    Item3 = 0,
    Item4 = 1,
}

export interface MyObjType {
    att1: string;
}

export interface MyBasicTypes {
    stringItem: string;
    numberItem: number;
    boolItem: boolean;
    enumItem: MyEnumType;
    nativeEnumItem: MyNativeEnumType;
    literalItem: "ImLiteral";
    anyItem: any;
    dateItem: Date;
    setItem: Set<number>;
    arrayItem: string[];
    myObj: MyObjType;
}