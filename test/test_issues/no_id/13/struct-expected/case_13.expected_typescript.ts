export interface Page<TCursor, TContent> {
    cursor: TCursor;
    content: TContent;
    total: number;
}

export interface Item {
    id: string;
    price: number;
}

export interface PageOfItems extends Page<number, Item> {}

export interface PageOfIds extends Page<string, string[]> {}
