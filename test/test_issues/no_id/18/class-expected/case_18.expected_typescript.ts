export enum MessageType {
    UserCreated = "UserCreated",
    UserDeleted = "UserDeleted",
}

export class UserCreated {
    id: string;
    name: string;

    constructor(data: UserCreated) {
        this.id = data.id;
        this.name = data.name;
    }
}

export class UserDeleted {
    id: string;
    reason?: string;

    constructor(data: UserDeleted) {
        this.id = data.id;
        this.reason = data.reason;
    }
}

export class Message<K, P> {
    type: K;
    payload: P;
    sentAt: number;

    constructor(data: Message<K, P>) {
        this.type = data.type;
        this.payload = data.payload;
        this.sentAt = data.sentAt;
    }
}

export type AnyMessage =
    | Message<MessageType.UserCreated, UserCreated>
    | Message<MessageType.UserDeleted, UserDeleted>;

