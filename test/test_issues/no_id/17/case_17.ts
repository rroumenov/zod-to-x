import { z } from "zod";
import {
    Application,
    createGenericType,
    Domain,
    useGenericType,
    Zod2XModel,
    extendZod,
} from "../../../../dist";
extendZod(z);

/**
 * Case 17: Literals of an enum used as templates of a generic type
 *
 * - Use case:
 * A generic type has a property that uses a template (`kind: createGenericType("T")`), and it is
 * instantiated with a literal linked to an enum (`z.literal("Created").zod2x(EventKind)`), both
 * with an enum of another layer and with an enum of the same file.
 *
 * - Previous state (reproduced with 1.8.0, Zod 3; also reported with Zod 4):
 * `useGenericType` took the metadata of the literal (`{ parentEnum }`) as the one of a named
 * type without name nor layer, so transpiling the model failed:
 * `TypeError: Cannot read properties of undefined (reading 'index')`.
 *
 * - Current state:
 * The template is transpiled as a literal of its enum (`Event<EventKind.Created>`), but Python
 * outputs `Literal[...]` without importing `Literal` when all the literals of the file are
 * linked to an enum.
 *
 * @expected
 * export interface CreatedEvent extends CASE_17_DOMAIN.Event<CASE_17_DOMAIN.EventKind.Created> {}
 * export interface OpenedEvent extends CASE_17_DOMAIN.Event<Status.Opened> {}
 *
 * Languages without literal types (C++, Dart, Go) use the enum as the template.
 */

@Domain({ namespace: "CASE_17_DOMAIN", file: "case_17_domain" })
class Case17Domain extends Zod2XModel {
    readonly EventKind = z.enum(["Created", "Deleted"]);

    readonly Event = z.object({
        kind: createGenericType("T"),
        at: z.number(),
    });
}

export const case17Domain = new Case17Domain();

@Application({ namespace: "CASE_17_APP", file: "case_17_app" })
class Case17App extends Zod2XModel {
    readonly Status = z.enum(["Opened", "Closed"]);

    // Literal of an enum of another layer.
    readonly CreatedEvent = useGenericType(case17Domain.Event, {
        kind: z.literal(case17Domain.EventKind.enum.Created).zod2x(case17Domain.EventKind),
    });

    // Literal of an enum of the same file.
    readonly OpenedEvent = useGenericType(case17Domain.Event, {
        kind: z.literal(this.Status.enum.Opened).zod2x(this.Status),
    });
}

export const case17App = new Case17App();
