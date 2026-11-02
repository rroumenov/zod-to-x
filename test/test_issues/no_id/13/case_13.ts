import { z } from "zod";
import { createGenericType, Domain, useGenericType, Zod2XModel, extendZod } from "../../../../dist";
extendZod(z);

/**
 * Case 13: Templates of generic types are misaligned when not using named types
 *
 * - Use case:
 * A generic type with several templates is instantiated using basic types, arrays or other
 * not named types for some of its templates.
 *
 * - Current state:
 * Only templates that use named types are translated, so the rest of templates are skipped and
 * the translated ones are assigned to the wrong template.
 *
 * @current
 * export interface PageOfItems extends Page<Item> {}
 * export interface PageOfIds extends Page {}
 *
 * @expected
 * export interface PageOfItems extends Page<number, Item> {}
 * export interface PageOfIds extends Page<string, string[]> {}
 */

@Domain({ namespace: "CASE_13_DOMAIN", file: "case_13_domain" })
class Case13Domain extends Zod2XModel {
    readonly Page = z.object({
        cursor: createGenericType("TCursor"),
        content: createGenericType("TContent"),
        total: z.number().int(),
    });

    readonly Item = z.object({
        id: z.string(),
        price: z.number(),
    });

    readonly PageOfItems = useGenericType(this.Page, {
        cursor: z.number().int(),
        content: this.Item,
    });

    readonly PageOfIds = useGenericType(this.Page, {
        cursor: z.string(),
        content: z.array(z.string()),
    });
}

export const case13Domain = new Case13Domain();
