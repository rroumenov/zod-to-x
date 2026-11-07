export enum SortField {
    Name = "Name",
    Date = "Date",
}

export interface Item {
    id: string;
}

export interface Box<T> {
    value: T;
}

export interface Pair<A, B> {
    first: A;
    second: B;
}

export interface ItemBox extends Box<Item> {}

export interface StrBox extends Box<string> {}

export interface SortBox extends Box<SortField> {}

export interface ItemPair extends Pair<Item, SortField> {}

export enum MessageType {
    Ping = "Ping",
    Sort = "Sort",
    Item = "Item",
}

export interface Message<K, P> {
    type: K;
    payload: P;
}

export type AnyMessage =
    | Message<MessageType.Ping, string>
    | Message<MessageType.Sort, SortField>
    | Message<MessageType.Item, Item>;

export interface Holder {
    message: AnyMessage;
    messages: AnyMessage[];
}

