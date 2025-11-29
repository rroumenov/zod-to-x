import { z } from "zod";
import { extendZod } from "../src/lib/zod_ext";
extendZod(z);

import { Infrastructure, Zod2XModel } from "../src/layered-modeling";
import { createGenericType, useGenericType } from "../src/lib/zod_helpers";
import { Zod2Ts } from "../src/transpilers";

@Infrastructure({
    namespace: "TS_GENERICS_INFRA",
    file: "ts_generics.infra",
})
class TsGenericsInfrastructure extends Zod2XModel {
    readonly httpSuccessfulResponse = z.object({
        success: z.literal(true),
        data: createGenericType("T"),
    });

    readonly someDtoResult = z.object({
        id: z.string(),
        name: z.string(),
        age: z.number().int().nonnegative(),
    });

    readonly internalObjectWithGeneric = useGenericType(this.httpSuccessfulResponse, {
        data: this.someDtoResult,
    });

    readonly objectWithGeneric = z.object({
        internal: z.lazy(() => this.internalObjectWithGeneric),
        item: useGenericType(this.httpSuccessfulResponse, { data: this.someDtoResult }),
    });
}

export const tsGenericsInfrastructure = new TsGenericsInfrastructure();

const output = tsGenericsInfrastructure.transpile(Zod2Ts);
console.log(output);
