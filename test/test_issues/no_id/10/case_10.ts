import { z } from "zod";
import { Domain, Zod2XModel, extendZod } from "../../../../dist";
extendZod(z);

/**
 * Case 10: Type names are lost when Zod metadata is added
 *
 * - Use case:
 * Nested types are named using `zod2x` and then documented using `.describe()` or `.meta()`.
 * Some of them also have a Zod `id`, used for JSON Schema generation.
 *
 * - Current state:
 * `.describe()` and `.meta()` return a new schema instance that does not keep the `zod2x`
 * metadata, so the transpilation fails because the type name is missing. Using `zod2x` on a
 * schema with a Zod `id` fails because the `id` is registered twice in Zod's global registry.
 *
 * @current
 * AstTypeNameDefinitionError: enum type must have a typeName...
 * Error: ID AccountAddress already exists in the registry
 *
 * @expected
 * // Account status
 * export enum Status {
 *     Active = "Active",
 *     Inactive = "Inactive",
 * }
 * ...
 */

const Status = z.enum(["Active", "Inactive"]).zod2x("Status").describe("Account status");

const Address = z
    .object({
        street: z.string(),
        city: z.string(),
    })
    .meta({ id: "AccountAddress" })
    .zod2x("Address")
    .meta({ description: "Postal address" });

@Domain({ namespace: "CASE_10_DOMAIN", file: "case_10_domain" })
class Case10Domain extends Zod2XModel {
    readonly Account = z.object({
        id: z.string(),
        status: Status,
        address: Address,
    });
}

export const case10Domain = new Case10Domain();
