export class Item {
    id: string;
    price: number;

    constructor(data: Item) {
        this.id = data.id;
        this.price = data.price;
    }
}

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

export class PageDefault extends Page<string, Item> {}

export class PageOfNumbers extends Page<string, number[]> {}

export class PageCustom extends Page<number, Item[]> {}

export class Catalog {
    firstPage: Page<string, Item>;

    constructor(data: Catalog) {
        this.firstPage = data.firstPage;
    }
}
