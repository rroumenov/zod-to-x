import { z } from "zod";
import { createGenericType, Domain, useGenericType, Zod2XModel, extendZod } from "../../../../dist";
extendZod(z);

/**
 * Case 14: Generic templates with default types
 *
 * - Use case:
 * A generic type defines default types for some of its templates, both basic and named types.
 * Instances of the generic type omit some or all of the templates that have a default type.
 *
 * - Current state:
 * An error is thrown because no child type is provided for the omitted templates.
 *
 * @expected
 * export interface PageDefault extends Page<string, Item> {}
 * export interface PageOfNumbers extends Page<string, number[]> {}
 * export interface PageCustom extends Page<number, Item[]> {}
 */

@Domain({ namespace: "CASE_14_DOMAIN", file: "case_14_domain" })
class Case14Domain extends Zod2XModel {
    readonly Item = z.object({
        id: z.string(),
        price: z.number(),
    });

    readonly Page = z.object({
        cursor: createGenericType("TCursor", z.string()),
        content: createGenericType("TContent", this.Item),
        total: z.number().int(),
    });

    // All templates take their default type.
    readonly PageDefault = useGenericType(this.Page, {});

    // Only some templates take their default type.
    readonly PageOfNumbers = useGenericType(this.Page, {
        content: z.array(z.number()),
    });

    // Default types are overridden.
    readonly PageCustom = useGenericType(this.Page, {
        cursor: z.number().int(),
        content: z.array(this.Item),
    });

    // Inline usage.
    readonly Catalog = z.object({
        firstPage: useGenericType(this.Page, {}),
    });
}

export const case14Domain = new Case14Domain();
