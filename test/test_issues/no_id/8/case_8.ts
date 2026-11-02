import { z } from "zod";
import { Domain, Zod2XModel, extendZod } from "../../../../dist";
extendZod(z);

/**
 * Case 8: Zod 4 wrapper types are not supported
 *
 * - Use case:
 * A model uses wrappers that do not change the data model type, such as `.default()`,
 * `.prefault()`, `.catch()`, `.readonly()`, `.nonoptional()`, pipes, or `z.unknown()`.
 *
 * - Current state:
 * `.default()` crashes the transpilation (`defaultValue is not a function`), and the rest of
 * wrappers are transpiled as unsupported `any` types.
 *
 * @current
 * TypeError: schema.def.defaultValue is not a function
 *
 * @expected
 * export interface Settings {
 *     name: string;
 *     retries: number;
 *     ...
 * }
 */

@Domain({ namespace: "CASE_8_DOMAIN", file: "case_8_domain" })
class Case8Domain extends Zod2XModel {
    readonly Settings = z.object({
        name: z.string().default("unnamed"),
        retries: z.int().prefault(3),
        enabled: z.boolean().catch(false),
        tags: z.array(z.string()).readonly(),
        nickname: z.string().optional().nonoptional(),
        port: z.string().pipe(z.coerce.number().int()),
        title: z.string().transform((s) => s.trim()),
        extra: z.unknown(),
    });
}

export const case8Domain = new Case8Domain();
