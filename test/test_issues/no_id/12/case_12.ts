import { z } from "zod";
import { Application, Domain, Zod2XModel, extendZod } from "../../../../dist";
extendZod(z);

/**
 * Case 12: Layer of shared types depends on the order in which models are created
 *
 * - Use case:
 * A schema is shared by models of different layers. The model of the higher layer is created
 * first (for example, due to the import order of the files).
 *
 * - Current state:
 * The first model that uses the schema takes it as its own type. The application layer defines
 * the `ShippingAddress` type, and the domain layer fails because it cannot use types of a higher layer.
 * If the domain model is created first, the domain layer defines it instead.
 *
 * @current
 * export interface ShippingAddress {
 *     street: string;
 *     city: string;
 * }
 * // And Domain transpilation throws BadLayerDefinitionError
 *
 * @expected
 * import * as CASE_12_DOMAIN from "./case_12_domain";
 *
 * export interface ShippingAddress extends CASE_12_DOMAIN.Address {}
 * ...
 */

const SharedAddress = z.object({
    street: z.string(),
    city: z.string(),
});

@Domain({ namespace: "CASE_12_DOMAIN", file: "case_12_domain" })
class Case12Domain extends Zod2XModel {
    readonly Address = SharedAddress;

    readonly Customer = z.object({
        name: z.string(),
        address: this.Address,
    });
}

@Application({ namespace: "CASE_12_APP", file: "case_12_app" })
class Case12App extends Zod2XModel {
    readonly ShippingAddress = SharedAddress;

    readonly ShippingRequest = z.object({
        orderId: z.string(),
        destination: SharedAddress,
    });
}

// Application model is intentionally created before the domain model.
export const case12App = new Case12App();
export const case12Domain = new Case12Domain();
