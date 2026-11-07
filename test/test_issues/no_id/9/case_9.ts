import { z } from "zod";
import { Application, Domain, Zod2XModel, extendZod } from "../../../../dist";
extendZod(z);

/**
 * Case 9: Local types are dropped when an imported type shares their name
 *
 * - Use case:
 * An application layer defines a `User` type and also references the domain `User` type, which
 * is imported from another file.
 *
 * - Current state:
 * AST nodes are stored by type name only, so the first registered type wins and the local `User`
 * type is silently dropped from the output.
 *
 * - Note:
 * Dart is not included, because Dart imports are not prefixed and both types cannot coexist. In
 * that case, the Dart transpiler raises an error.
 *
 * @current
 * export interface Wrapper {
 *     domainUser: CASE_9_DOMAIN.User;
 * }
 *
 * @expected
 * export interface Wrapper {
 *     domainUser: CASE_9_DOMAIN.User;
 * }
 *
 * export interface User {
 *     name: string;
 *     isAdmin: boolean;
 * }
 */

@Domain({ namespace: "CASE_9_DOMAIN", file: "case_9_domain" })
class Case9Domain extends Zod2XModel {
    readonly User = z.object({
        id: z.string(),
    });
}

export const case9Domain = new Case9Domain();

@Application({ namespace: "CASE_9_APP", file: "case_9_app" })
class Case9App extends Zod2XModel {
    readonly Wrapper = z.object({
        domainUser: case9Domain.User,
    });

    readonly User = z.object({
        name: z.string(),
        isAdmin: z.boolean(),
    });
}

export const case9App = new Case9App();
