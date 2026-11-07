export enum EventKind {
    Created = "Created",
    Deleted = "Deleted",
    Archived = "Archived",
}

export interface Created {
    kind: EventKind.Created;
    id: string;
}

export interface Deleted {
    kind: EventKind.Deleted;
    id: string;
    reason?: string;
}

export enum MessageType {
    Info = "Info",
    Alert = "Alert",
}

export interface Message<K, P> {
    type: K;
    payload: P;
}

export interface Notice {
    text: string;
}

export interface Alert {
    text: string;
    level: number;
}

