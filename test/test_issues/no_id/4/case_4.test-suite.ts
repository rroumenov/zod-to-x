import { Zod2XTranspilers } from "../../../../dist";
import { createGenericTestSuite } from "../../../common/utils";
import { errorCodesModels } from "./case_4";

export const runCase4Suite = createGenericTestSuite(
    "Case 4",
    errorCodesModels,
    Zod2XTranspilers.Zod2Ts,
    "./test/test_issues/no_id/4"
);
