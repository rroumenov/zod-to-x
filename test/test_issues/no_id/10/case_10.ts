import { z } from "zod";
import { Domain, Zod2XModel, extendZod } from "../../../../dist";
extendZod(z);

/**
 * Case 10: Type names are lost when a schema is documented or its unknown keys policy changes
 *
 * - Use case:
 * Nested types are named using `zod2x` and then documented using `.describe()`, or made strict
 * using `.strict()`.
 *
 * - Current state:
 * `.describe()` and `.strict()` return a new schema instance that does not keep the `zod2x`
 * metadata, so the transpilation fails because the type name is missing.
 *
 * @current
 * AstTypeNameDefinitionError: ZodEnum type must have a typeName...
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
    .zod2x("Address")
    .describe("Postal address")
    .strict();

@Domain({ namespace: "CASE_10_DOMAIN", file: "case_10_domain" })
class Case10Domain extends Zod2XModel {
    readonly Account = z.object({
        id: z.string(),
        status: Status,
        address: Address,
    });
}

export const case10Domain = new Case10Domain();
