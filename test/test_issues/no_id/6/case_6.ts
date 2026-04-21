import { z } from "zod";
import {
    Application,
    Domain,
    createGenericType,
    useGenericType,
    Zod2XModel,
    extendZod,
} from "../../../../dist";
extendZod(z);

/**
 * Case 6: Aliases of domain-layer generic types incorrectly carry template parameters
 *
 * - Use case:
 * A domain layer defines a generic object type (GenericBox) and a concrete instantiation of it
 * (ConcreteBox). An application layer creates simple aliases pointing to both.
 *
 * - Current state (two bugs):
 * 1. An alias of a generic template does not propagate the generic parameter.
 * 2. An alias of a concrete generic instantiation incorrectly carries the instantiated
 *    template arguments, even though the type is already resolved.
 *
 * @current
 * export interface GenericBoxAlias extends CASE_6_DOMAIN.GenericBox {}
 * export interface ConcreteBoxAlias extends CASE_6_DOMAIN.ConcreteBox<CASE_6_DOMAIN.ItemPayload> {}
 *
 * @expected
 * export interface GenericBoxAlias<T> extends CASE_6_DOMAIN.GenericBox<T> {}
 * export interface ConcreteBoxAlias extends CASE_6_DOMAIN.ConcreteBox {}
 */

@Domain({ namespace: "CASE_6_DOMAIN", file: "case_6_domain" })
class Case6Domain extends Zod2XModel {
    readonly GenericBox = z.object({
        id: z.string(),
        content: createGenericType("T"),
    });

    readonly ItemPayload = z.object({
        name: z.string(),
        value: z.number(),
    });

    readonly ConcreteBox = useGenericType(this.GenericBox, {
        content: this.ItemPayload,
    });
}

export const case6Domain = new Case6Domain();

@Application({ namespace: "CASE_6_APP", file: "case_6_app" })
class Case6App extends Zod2XModel {
    // Alias of the generic template — should produce no type params
    readonly GenericBoxAlias = case6Domain.GenericBox;

    // Alias of the concrete generic instantiation — should also produce no type params
    readonly ConcreteBoxAlias = case6Domain.ConcreteBox;
}

export const case6App = new Case6App();
