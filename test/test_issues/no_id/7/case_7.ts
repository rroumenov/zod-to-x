import { z } from "zod";
import { Domain, Zod2XModel, extendZod } from "../../../../dist";
extendZod(z);

/**
 * Case 7: Modifiers of lazy schemas are lost
 *
 * - Use case:
 * A model references other types through `z.lazy()`, and wraps the lazy schema with
 * `.optional()`, `.nullable()` or `z.array()`.
 *
 * - Current state:
 * Lazy schemas are resolved after the AST is built and the resolved node overwrites the pending
 * one, dropping the modifiers applied by wrappers. Lazy basic types also crash the transpilation
 * because the resolved node keeps the prototype of the pending definition.
 *
 * @current
 * export interface Folder {
 *     mainFile: File;
 *     readme: File;
 *     files: File;
 *     ...
 * }
 *
 * @expected
 * export interface Folder {
 *     mainFile: File | null;
 *     readme?: File;
 *     files: File[];
 *     ...
 * }
 */

@Domain({ namespace: "CASE_7_DOMAIN", file: "case_7_domain" })
class Case7Domain extends Zod2XModel {
    readonly File = z.object({
        name: z.string(),
        size: z.number().int(),
    });

    readonly Folder = z.object({
        name: z.string(),
        mainFile: z.lazy(() => this.File).nullable(),
        readme: z.lazy(() => this.File).optional(),
        files: z.array(z.lazy(() => this.File)),
        owner: z.lazy(() => z.string()).optional(),
    });
}

export const case7Domain = new Case7Domain();
