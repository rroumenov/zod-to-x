import { z } from "zod";
import { Application, Domain, Zod2XModel, Zod2XTranspilers, extendZod } from "../../../../dist";
extendZod(z);

/**
 * Case 15: Transpiled models are not updated when models are created afterwards
 *
 * - Use case:
 * A schema is shared by models of different layers. The model of the higher layer is created and
 * transpiled before the model of the lower layer is created (for example, by a script that
 * generates the file of each layer as soon as it is imported).
 *
 * - Current state:
 * The AST of the application model is cached when it is transpiled for the first time. When the
 * domain model is created, the shared type is moved to the domain layer, but the application
 * model keeps transpiling its cached AST, so both files define the type.
 *
 * @current
 * export interface Price {
 *     amount: number;
 *     currency: string;
 * }
 * ...
 *
 * @expected
 * import * as CASE_15_DOMAIN from "./case_15_domain";
 *
 * export interface Price extends CASE_15_DOMAIN.Money {}
 * ...
 */

const SharedMoney = z.object({
    amount: z.number(),
    currency: z.string(),
});

@Application({ namespace: "CASE_15_APP", file: "case_15_app" })
class Case15App extends Zod2XModel {
    readonly Price = SharedMoney;

    readonly Invoice = z.object({
        id: z.string(),
        total: SharedMoney,
    });
}

export const case15App = new Case15App();

// Transpiled before the domain model exists.
case15App.transpile(Zod2XTranspilers.Zod2Ts);

@Domain({ namespace: "CASE_15_DOMAIN", file: "case_15_domain" })
class Case15Domain extends Zod2XModel {
    readonly Money = SharedMoney;
}

export const case15Domain = new Case15Domain();
