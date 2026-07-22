import { Zod2XTranspilers } from "../../../../dist";
import { createGenericTestSuite } from "../../../common/utils";
import { errorCodesModels } from "./case_4";

const runCase4TsSuite = createGenericTestSuite(
    "Case 4",
    errorCodesModels,
    Zod2XTranspilers.Zod2Ts,
    "./test/test_issues/no_id/4"
);

const runCase4GoSuite = createGenericTestSuite(
    "Case 4",
    errorCodesModels,
    Zod2XTranspilers.Zod2Go,
    "./test/test_issues/no_id/4",
    "golang"
);

const runCase4DartSuite = createGenericTestSuite(
    "Case 4",
    errorCodesModels,
    Zod2XTranspilers.Zod2Dart,
    "./test/test_issues/no_id/4",
    "dart"
);

export const runCase4Suite = () => {
    runCase4TsSuite();
    runCase4GoSuite();
    runCase4DartSuite();
};
