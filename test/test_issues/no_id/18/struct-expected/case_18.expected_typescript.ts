export enum MessageType {
    UserCreated = "UserCreated",
    UserDeleted = "UserDeleted",
}

export interface UserCreated {
    id: string;
    name: string;
}

export interface UserDeleted {
    id: string;
    reason?: string;
}

export interface Message<K, P> {
    type: K;
    payload: P;
    sentAt: number;
}

export type AnyMessage =
    | Message<MessageType.UserCreated, UserCreated>
    | Message<MessageType.UserDeleted, UserDeleted>;

