import { z } from "zod";
import { Application, Domain, extendZod, Zod2XModel } from "../../../../dist";
extendZod(z);

/**
 * Case 21: Aliases of other types lose the description set on them
 *
 * - Use case:
 * A model documents a type that extends another one (`UtmId = basicTypes.UUID.describe("...")`).
 *
 * - Previous state:
 * The alias was transpiled without its description, as aliases do not emit comments.
 *
 * @previous
 * export type UtmId = CASE_21_DOMAIN.Uuid;
 *
 * @expected
 * // Identifier of the UTM campaign.
 * export type UtmId = CASE_21_DOMAIN.Uuid;
 *
 * Only the description set on the alias is emitted: an alias without its own description does not
 * repeat the description of the type it extends.
 */

@Domain({ namespace: "CASE_21_DOMAIN", file: "case_21_domain" })
class Case21Domain extends Zod2XModel {
    readonly Uuid = z.string().uuid();

    readonly Documented = z.string().describe("Description of the base type.");

    readonly Address = z.object({
        street: z.string(),
    });

    readonly Currency = z.enum(["EUR", "USD"]);

    readonly Tags = z.array(z.string());
}

export const case21Domain = new Case21Domain();

@Application({ namespace: "CASE_21_APP", file: "case_21_app" })
class Case21App extends Zod2XModel {
    readonly UtmId = case21Domain.Uuid.describe("Identifier of the UTM campaign.");

    readonly ShippingAddress = case21Domain.Address.describe("Where the order is sent.");

    readonly PaymentCurrency = case21Domain.Currency.describe("Currency of the payment.");

    readonly OrderTags = case21Domain.Tags.describe("Tags of the order.");

    // Own description, replacing the one of the extended type.
    readonly Renamed = case21Domain.Documented.describe("Description of the alias.");

    // No description of its own: the description of the extended type is not repeated.
    readonly Inherited = case21Domain.Documented;

    readonly Undocumented = case21Domain.Uuid;

    readonly Contact = z.object({
        email: z.string(),
    });

    // Alias of a type of the same file.
    readonly Customer = this.Contact.describe("Contact that places the order.");
}

export const case21App = new Case21App();
