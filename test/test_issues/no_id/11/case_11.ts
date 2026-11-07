import { z } from "zod";
import { Domain, Zod2XModel, extendZod } from "../../../../dist";
extendZod(z);

/**
 * Case 11: Type names set with zod2x in layered models create dangling aliases
 *
 * - Use case:
 * A layered model uses `zod2x` to enforce a type name different from the property name, as
 * documented in the Layered Modeling section.
 *
 * - Current state:
 * The type is handled as an alias of another type named after `zod2x`, which is never
 * transpiled, so the output references an undefined type.
 *
 * @current
 * export interface User extends UserEntity {}
 *
 * export interface Group {
 *     owner: UserEntity;
 * }
 *
 * @expected
 * export interface UserEntity {
 *     id: string;
 *     name: string;
 * }
 *
 * export interface Group {
 *     owner: UserEntity;
 * }
 */

@Domain({ namespace: "CASE_11_DOMAIN", file: "case_11_domain" })
class Case11Domain extends Zod2XModel {
    readonly User = z
        .object({
            id: z.string(),
            name: z.string(),
        })
        .zod2x("UserEntity");

    readonly Group = z.object({
        owner: this.User,
        members: z.array(this.User),
    });
}

export const case11Domain = new Case11Domain();
