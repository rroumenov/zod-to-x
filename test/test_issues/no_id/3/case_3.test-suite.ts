import { Zod2XTranspilers } from "../../../../dist";
import { createGenericTestSuite } from "../../../common/utils";
import { weatherServiceApi } from "./case_3";

const runCase3TsSuite = createGenericTestSuite(
    "Case 3",
    weatherServiceApi,
    Zod2XTranspilers.Zod2Ts,
    "./test/test_issues/no_id/3"
);

const runCase3GoSuite = createGenericTestSuite(
    "Case 3",
    weatherServiceApi,
    Zod2XTranspilers.Zod2Go,
    "./test/test_issues/no_id/3",
    "golang"
);

export const runCase3Suite = () => {
    runCase3TsSuite();
    runCase3GoSuite();
};
