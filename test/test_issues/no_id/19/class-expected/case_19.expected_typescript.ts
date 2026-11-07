import * as CASE_19_DOMAIN from "./case_19_domain";

export type AnyEvent =
    | CASE_19_DOMAIN.Created
    | CASE_19_DOMAIN.Deleted;

export class Archived {
    kind: CASE_19_DOMAIN.EventKind.Archived;
    id: string;

    constructor(data: Archived) {
        this.kind = data.kind;
        this.id = data.id;
    }
}

export type MixedEvent =
    | CASE_19_DOMAIN.Created
    | Archived;

export type AnyMessage =
    | CASE_19_DOMAIN.Message<CASE_19_DOMAIN.MessageType.Info, CASE_19_DOMAIN.Notice>
    | CASE_19_DOMAIN.Message<CASE_19_DOMAIN.MessageType.Alert, CASE_19_DOMAIN.Alert>;

export class EventLog {
    event: AnyEvent;
    mixed: MixedEvent;
    message: AnyMessage;
    history: AnyEvent[];
    last?: AnyEvent;

    constructor(data: EventLog) {
        this.event = data.event;
        this.mixed = data.mixed;
        this.message = data.message;
        this.history = data.history;
        this.last = data.last;
    }
}

