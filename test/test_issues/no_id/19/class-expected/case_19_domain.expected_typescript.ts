export enum EventKind {
    Created = "Created",
    Deleted = "Deleted",
    Archived = "Archived",
}

export class Created {
    kind: EventKind.Created;
    id: string;

    constructor(data: Created) {
        this.kind = data.kind;
        this.id = data.id;
    }
}

export class Deleted {
    kind: EventKind.Deleted;
    id: string;
    reason?: string;

    constructor(data: Deleted) {
        this.kind = data.kind;
        this.id = data.id;
        this.reason = data.reason;
    }
}

export enum MessageType {
    Info = "Info",
    Alert = "Alert",
}

export class Message<K, P> {
    type: K;
    payload: P;

    constructor(data: Message<K, P>) {
        this.type = data.type;
        this.payload = data.payload;
    }
}

export class Notice {
    text: string;

    constructor(data: Notice) {
        this.text = data.text;
    }
}

export class Alert {
    text: string;
    level: number;

    constructor(data: Alert) {
        this.text = data.text;
        this.level = data.level;
    }
}

