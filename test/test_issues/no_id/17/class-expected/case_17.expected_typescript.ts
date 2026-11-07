import * as CASE_17_DOMAIN from "./case_17_domain";

export enum Status {
    Opened = "Opened",
    Closed = "Closed",
}

export class CreatedEvent extends CASE_17_DOMAIN.Event<CASE_17_DOMAIN.EventKind.Created> {}

export class OpenedEvent extends CASE_17_DOMAIN.Event<Status.Opened> {}

