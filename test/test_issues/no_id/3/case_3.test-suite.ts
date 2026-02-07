import { Zod2XTranspilers } from "../../../../dist";
import { createGenericTestSuite } from "../../../common/utils";
import { weatherServiceApi } from "./case_3";

export const runCase3Suite = createGenericTestSuite(
    "Case 3",
    weatherServiceApi,
    Zod2XTranspilers.Zod2Ts,
    "./test/test_issues/no_id/3"
);
