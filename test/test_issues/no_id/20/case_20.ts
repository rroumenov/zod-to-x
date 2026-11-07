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
 * Case 20: Templates of generic types that are not classes
 *
 * - Use case:
 * Generic types are instantiated with types that are not classes (basic types and enums) and
 * with more than one template, and these instances are used as fields of another layer (also in
 * lists) and as variants of a discriminated union used as a field.
 *
 * - Previous state:
 * Dart deserializes and serializes generic types with a function per template, which was only
 * generated for one template of a class (`(j) => T.fromJson(...)`, `(v) => v.toJson()`):
 * - `Box.fromJson(json, (j) => String.fromJson(...))` and `SortField.fromJson(...)` failed to
 *   compile, and `Pair.fromJson(json, (j) => Item, SortField.fromJson(...))` was not valid Dart.
 * - Unions with instances of generic types were serialized with `toJson()`, without the
 *   functions of the templates (runtime error).
 *
 * @expected
 * The functions are generated for each template: enums by their value, basic types by casting
 * them, classes by their factory, and discriminated unions get a `<union>ToJson` function.
 */

@Domain({ namespace: "CASE_20_DOMAIN", file: "case_20_domain" })
class Case20Domain extends Zod2XModel {
    readonly SortField = z.enum(["Name", "Date"]);

    readonly Item = z.object({ id: z.string() });

    readonly Box = z.object({ value: createGenericType("T") });

    readonly Pair = z.object({ first: createGenericType("A"), second: createGenericType("B") });

    readonly ItemBox = useGenericType(this.Box, { value: this.Item });

    readonly StrBox = useGenericType(this.Box, { value: z.string() });

    readonly SortBox = useGenericType(this.Box, { value: this.SortField });

    readonly ItemPair = useGenericType(this.Pair, { first: this.Item, second: this.SortField });

    readonly MessageType = z.enum(["Ping", "Sort", "Item"]);

    readonly Message = z.object({ type: createGenericType("K"), payload: createGenericType("P") });

    readonly AnyMessage = z.discriminatedUnion("type", [
        useGenericType(
            this.Message,
            {
                type: z.literal(this.MessageType.Values.Ping).zod2x(this.MessageType),
                payload: z.string(),
            },
            true
        ),
        useGenericType(
            this.Message,
            {
                type: z.literal(this.MessageType.Values.Sort).zod2x(this.MessageType),
                payload: this.SortField,
            },
            true
        ),
        useGenericType(
            this.Message,
            {
                type: z.literal(this.MessageType.Values.Item).zod2x(this.MessageType),
                payload: this.Item,
            },
            true
        ),
    ]);

    readonly Holder = z.object({
        message: this.AnyMessage,
        messages: z.array(this.AnyMessage),
    });
}

export const case20Domain = new Case20Domain();

@Application({ namespace: "CASE_20_APP", file: "case_20_app" })
class Case20App extends Zod2XModel {
    readonly Usage = z.object({
        itemBox: case20Domain.ItemBox,
        strBox: case20Domain.StrBox,
        sortBox: case20Domain.SortBox,
        itemPair: case20Domain.ItemPair,
        pairs: z.array(case20Domain.ItemPair),
        message: case20Domain.AnyMessage,
    });
}

export const case20App = new Case20App();
