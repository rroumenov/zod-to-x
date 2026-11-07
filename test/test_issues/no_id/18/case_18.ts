import { z } from "zod";
import { createGenericType, Domain, useGenericType, Zod2XModel, extendZod } from "../../../../dist";
extendZod(z);

/**
 * Case 18: Discriminated unions of instances of a generic type with a generic discriminant
 *
 * - Use case:
 * A message envelope is a generic type whose discriminant and payload are templates
 * (`Message<K, P>`), and a discriminated union of its instances uses a literal of an enum as the
 * discriminant of each one (`type: z.literal("UserCreated").zod2x(MessageType)`).
 *
 * - Previous state:
 * The discriminant value was read from the generic type, where the discriminant is a template,
 * so it was lost ("Consider to set 'type' key of 'Message' as ZodLiteral"):
 * - Dart: `class Message<K, P> implements AnyMessage, AnyMessage` (compile error) and no
 *   `anyMessageFromJson` dispatcher.
 * - Go: `func (t Message[T]) isAnyMessage() {}` twice, with a wrong number of type parameters
 *   (compile error), and no `UnmarshalAnyMessage`.
 * - C++: the union was deserialized by trying each variant in order instead of by its
 *   discriminant, so payloads with compatible shapes could be deserialized as the wrong variant.
 *
 * @expected
 * The discriminant value is taken from the type used for the template of each instance:
 * - Dart: `class Message<K, P> implements AnyMessage` and a dispatcher that deserializes each
 *   template (`(j) => MessageType.values.firstWhere((e) => e.value == j)`).
 * - Go: `func (t Message[T1, T2]) isAnyMessage() {}` once, and `UnmarshalAnyMessage`.
 * - C++: `if (k == "UserCreated") x = j.get<Message<MessageType, UserCreated>>();`.
 * TypeScript and Python do not use the discriminant value, so their output is not changed.
 */

@Domain({ namespace: "CASE_18", file: "case_18" })
class Case18Domain extends Zod2XModel {
    readonly MessageType = z.enum(["UserCreated", "UserDeleted"]);

    readonly UserCreated = z.object({
        id: z.string(),
        name: z.string(),
    });

    readonly UserDeleted = z.object({
        id: z.string(),
        reason: z.string().optional(),
    });

    readonly Message = z.object({
        type: createGenericType("K"),
        payload: createGenericType("P"),
        sentAt: z.number(),
    });

    readonly AnyMessage = z.discriminatedUnion("type", [
        useGenericType(
            this.Message,
            {
                type: z.literal(this.MessageType.enum.UserCreated).zod2x(this.MessageType),
                payload: this.UserCreated,
            },
            true
        ),
        useGenericType(
            this.Message,
            {
                type: z.literal(this.MessageType.enum.UserDeleted).zod2x(this.MessageType),
                payload: this.UserDeleted,
            },
            true
        ),
    ]);
}

export const case18Domain = new Case18Domain();
