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

const runCase3DartSuite = createGenericTestSuite(
    "Case 3",
    weatherServiceApi,
    Zod2XTranspilers.Zod2Dart,
    "./test/test_issues/no_id/3",
    "dart"
);

export const runCase3Suite = () => {
    runCase3TsSuite();
    runCase3GoSuite();
    runCase3DartSuite();
};
