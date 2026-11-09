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
 * Case 16: References to a type of another file use that type, even if the model redeclares it
 *
 * - Use case:
 * A model declares an alias of a type of another layer (`ShippingAddress = domain.Address`) for a
 * specific role, and uses the original type in other types of the model.
 *
 * - Previous state:
 * The other types of the model were transpiled with the alias, replacing the type they reference
 * with a role they do not have. A second redeclaration of the type reverted them all.
 *
 * @previous
 * export interface Order {
 *     destination: ShippingAddress;
 *     ...
 * }
 *
 * @expected
 * export interface Order {
 *     destination: CASE_16_DOMAIN.Address;
 *     ...
 * }
 *
 * References keep the type they use directly, through the property of the model that declares
 * the type, as a copy (`.describe()`), inside other schemas (arrays, optionals) and as templates
 * of generic types, regardless of how many times the model redeclares it.
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

    // Declared twice, as independent aliases of the domain type.
    readonly PaymentCurrency = case16Domain.Currency;
    readonly RefundCurrency = case16Domain.Currency;

    readonly Contact = z.object({
        email: z.string(),
    });

    // Alias of a type of the same file.
    readonly Customer = this.Contact;

    readonly Order = z.object({
        id: z.string(),
        destination: case16Domain.Address,
        billing: case16Domain.Address.describe("Billing address").optional(),
        items: z.array(SharedItem),
        currency: case16Domain.Currency,
        contact: this.Contact,
    });

    readonly AddressList = z.array(case16Domain.Address);

    readonly OrderItemPage = useGenericType(case16Domain.Page, {
        data: case16Domain.Item,
    });
}

export const case16App = new Case16App();
