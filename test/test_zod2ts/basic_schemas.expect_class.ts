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

export class MyObjType {
    att1: string;

    constructor(data: MyObjType) {
        this.att1 = data.att1;
    }
}

export class MyBasicTypes {
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

    constructor(data: MyBasicTypes) {
        this.stringItem = data.stringItem;
        this.numberItem = data.numberItem;
        this.boolItem = data.boolItem;
        this.enumItem = data.enumItem;
        this.nativeEnumItem = data.nativeEnumItem;
        this.literalItem = data.literalItem;
        this.anyItem = data.anyItem;
        this.dateItem = data.dateItem;
        this.setItem = data.setItem;
        this.arrayItem = data.arrayItem;
        this.myObj = data.myObj;
    }
}