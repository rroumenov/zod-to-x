import { z } from "zod";
import { Domain, Zod2XModel, extendZod } from "../../../../dist";
extendZod(z);

/**
 * Case 8: Zod wrapper types are not supported
 *
 * - Use case:
 * A model uses wrappers that do not change the data model type, such as `.catch()`,
 * `.readonly()`, `.brand()`, effects (`.refine()`, `.transform()`, `z.preprocess()`), pipelines,
 * or `z.unknown()`.
 *
 * - Current state:
 * Only `.default()` is supported. The rest of wrappers are transpiled as unsupported `any` types.
 *
 * @current
 * export interface Settings {
 *     name: string;
 *     retries: any;
 *     enabled: any;
 *     ...
 * }
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
        retries: z.number().int().brand<"Retries">(),
        enabled: z.boolean().catch(false),
        tags: z.array(z.string()).readonly(),
        nickname: z.preprocess(
            (v) => String(v),
            z.string().refine((s) => s.length > 0)
        ),
        port: z.string().pipe(z.coerce.number().int()),
        title: z.string().transform((s) => s.trim()),
        extra: z.unknown(),
    });
}

export const case8Domain = new Case8Domain();
