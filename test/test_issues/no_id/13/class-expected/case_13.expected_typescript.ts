export class Page<TCursor, TContent> {
    cursor: TCursor;
    content: TContent;
    total: number;

    constructor(data: Page<TCursor, TContent>) {
        this.cursor = data.cursor;
        this.content = data.content;
        this.total = data.total;
    }
}

export class Item {
    id: string;
    price: number;

    constructor(data: Item) {
        this.id = data.id;
        this.price = data.price;
    }
}

export class PageOfItems extends Page<number, Item> {}

export class PageOfIds extends Page<string, string[]> {}
