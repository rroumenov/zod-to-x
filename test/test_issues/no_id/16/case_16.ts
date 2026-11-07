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
 * Case 16: References to types of other files ignore the alias declared by the model
 *
 * - Use case:
 * A model declares an alias of a type of another layer (`ShippingAddress = domain.Address`) and
 * uses that type in other types of the model.
 *
 * - Current state:
 * The alias is declared, but the other types of the model use the type of the other layer, so
 * the alias is not used by the model and the file depends on the other layer for both.
 *
 * @current
 * export interface Order {
 *     destination: CASE_16_DOMAIN.Address;
 *     ...
 * }
 *
 * @expected
 * export interface Order {
 *     destination: ShippingAddress;
 *     ...
 * }
 *
 * References use the alias of the model directly, through the property of the model that
 * declares the type, as a copy (`.describe()`), inside other schemas (arrays, optionals) and as
 * templates of generic types. A type that the model declares twice is ambiguous, so its
 * references keep using the type of the other layer. Aliases of types of the same file
 * (`Home = this.Address`) are not used either.
 */

const SharedItem = z.object({
    name: z.string(),
    price: z.number(),
});

@Domain({ namespace: "CASE_16_DOMAIN", file: "case_16_domain" })
class Case16Domain extends Zod2XModel {
    readonly Address = z.object({
        street: z.string(),
        city: z.string(),
    });

    readonly Item = SharedItem;

    readonly Currency = z.enum(["EUR", "USD"]);

    readonly Page = z.object({
        data: createGenericType("T"),
        total: z.number(),
    });
}

export const case16Domain = new Case16Domain();

@Application({ namespace: "CASE_16_APP", file: "case_16_app" })
class Case16App extends Zod2XModel {
    readonly ShippingAddress = case16Domain.Address;

    readonly OrderItem = SharedItem;

    // Declared twice: references use the domain type.
    readonly PaymentCurrency = case16Domain.Currency;
    readonly RefundCurrency = case16Domain.Currency;

    readonly Contact = z.object({
        email: z.string(),
    });

    // Alias of a type of the same file: references use the original type.
    readonly Customer = this.Contact;

    readonly Order = z.object({
        id: z.string(),
        destination: case16Domain.Address,
        billing: case16Domain.Address.describe("Billing address").optional(),
        items: z.array(SharedItem),
        currency: case16Domain.Currency,
        contact: this.Contact,
    });

    readonly OrderItemPage = useGenericType(case16Domain.Page, {
        data: case16Domain.Item,
    });
}

export const case16App = new Case16App();
