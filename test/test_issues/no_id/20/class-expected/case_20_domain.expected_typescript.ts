export enum SortField {
    Name = "Name",
    Date = "Date",
}

export class Item {
    id: string;

    constructor(data: Item) {
        this.id = data.id;
    }
}

export class Box<T> {
    value: T;

    constructor(data: Box<T>) {
        this.value = data.value;
    }
}

export class Pair<A, B> {
    first: A;
    second: B;

    constructor(data: Pair<A, B>) {
        this.first = data.first;
        this.second = data.second;
    }
}

export class ItemBox extends Box<Item> {}

export class StrBox extends Box<string> {}

export class SortBox extends Box<SortField> {}

export class ItemPair extends Pair<Item, SortField> {}

export enum MessageType {
    Ping = "Ping",
    Sort = "Sort",
    Item = "Item",
}

export class Message<K, P> {
    type: K;
    payload: P;

    constructor(data: Message<K, P>) {
        this.type = data.type;
        this.payload = data.payload;
    }
}

export type AnyMessage =
    | Message<MessageType.Ping, string>
    | Message<MessageType.Sort, SortField>
    | Message<MessageType.Item, Item>;

export class Holder {
    message: AnyMessage;
    messages: AnyMessage[];

    constructor(data: Holder) {
        this.message = data.message;
        this.messages = data.messages;
    }
}

