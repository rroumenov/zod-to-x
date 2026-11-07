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
 * Case 19: Discriminated unions of types of another layer
 *
 * - Use case:
 * A layer composes types of a lower layer in a discriminated union: types of the other layer
 * only, mixed with a local type, and instances of a generic type of the other layer. The unions
 * are used as fields (also in arrays and as optional fields).
 *
 * - Previous state:
 * The variants are declared in another file, so the union could not be declared on them:
 * - C++: the serializers of the union are in its namespace, but nlohmann finds them by ADL, in
 *   the namespaces of the alternatives only. Using the union failed to compile.
 * - Go: `func (t CASE_19_DOMAIN.Created) isAnyEvent() {}` failed to compile, methods cannot be
 *   declared on types of other packages.
 * - Dart: the classes of the other file do not implement the union, so its dispatcher failed to
 *   compile.
 *
 * @expected
 * - C++: `nlohmann::adl_serializer` is specialized for unions without local alternatives.
 * - Go: variants of other packages are wrapped in local types that embed them
 *   (`type AnyEventCreated struct { CASE_19_DOMAIN.Created }`).
 * - Dart: variants of other files are wrapped in local classes that implement the union
 *   (`class AnyEventCreated implements AnyEvent { final Created value; ... }`).
 */

@Domain({ namespace: "CASE_19_DOMAIN", file: "case_19_domain" })
class Case19Domain extends Zod2XModel {
    readonly EventKind = z.enum(["Created", "Deleted", "Archived"]);

    readonly Created = z.object({
        kind: z.literal(this.EventKind.enum.Created).zod2x(this.EventKind),
        id: z.string(),
    });

    readonly Deleted = z.object({
        kind: z.literal(this.EventKind.enum.Deleted).zod2x(this.EventKind),
        id: z.string(),
        reason: z.string().optional(),
    });

    readonly MessageType = z.enum(["Info", "Alert"]);

    readonly Message = z.object({
        type: createGenericType("K"),
        payload: createGenericType("P"),
    });

    readonly Notice = z.object({ text: z.string() });

    readonly Alert = z.object({ text: z.string(), level: z.number().int() });
}

export const case19Domain = new Case19Domain();

@Application({ namespace: "CASE_19_APP", file: "case_19_app" })
class Case19App extends Zod2XModel {
    // Variants of another layer only.
    readonly AnyEvent = z.discriminatedUnion("kind", [case19Domain.Created, case19Domain.Deleted]);

    readonly Archived = z.object({
        kind: z.literal(case19Domain.EventKind.enum.Archived).zod2x(case19Domain.EventKind),
        id: z.string(),
    });

    // Variants of another layer and of this layer.
    readonly MixedEvent = z.discriminatedUnion("kind", [case19Domain.Created, this.Archived]);

    // Instances of a generic type of another layer.
    readonly AnyMessage = z.discriminatedUnion("type", [
        useGenericType(
            case19Domain.Message,
            {
                type: z.literal(case19Domain.MessageType.enum.Info).zod2x(case19Domain.MessageType),
                payload: case19Domain.Notice,
            },
            true
        ),
        useGenericType(
            case19Domain.Message,
            {
                type: z
                    .literal(case19Domain.MessageType.enum.Alert)
                    .zod2x(case19Domain.MessageType),
                payload: case19Domain.Alert,
            },
            true
        ),
    ]);

    readonly EventLog = z.object({
        event: this.AnyEvent,
        mixed: this.MixedEvent,
        message: this.AnyMessage,
        history: z.array(this.AnyEvent),
        last: this.AnyEvent.optional(),
    });
}

export const case19App = new Case19App();
