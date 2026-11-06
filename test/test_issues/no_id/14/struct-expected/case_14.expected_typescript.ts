export interface Item {
    id: string;
    price: number;
}

export interface Page<TCursor, TContent> {
    cursor: TCursor;
    content: TContent;
    total: number;
}

export interface PageDefault extends Page<string, Item> {}

export interface PageOfNumbers extends Page<string, number[]> {}

export interface PageCustom extends Page<number, Item[]> {}

export interface Catalog {
    firstPage: Page<string, Item>;
}
