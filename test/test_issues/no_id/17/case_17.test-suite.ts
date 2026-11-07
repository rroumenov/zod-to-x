import { Zod2XTranspilers } from "../../../../dist";
import { createGenericTestSuite } from "../../../common/utils";
import { case17App } from "./case_17";

const runCase17TsSuite = createGenericTestSuite(
    "Case 17",
    case17App,
    Zod2XTranspilers.Zod2Ts,
    "./test/test_issues/no_id/17"
);

const runCase17PySuite = createGenericTestSuite(
    "Case 17",
    case17App,
    Zod2XTranspilers.Zod2Py,
    "./test/test_issues/no_id/17",
    "python"
);

const runCase17CppSuite = createGenericTestSuite(
    "Case 17",
    case17App,
    Zod2XTranspilers.Zod2Cpp,
    "./test/test_issues/no_id/17",
    "cpp"
);

const runCase17GoSuite = createGenericTestSuite(
    "Case 17",
    case17App,
    Zod2XTranspilers.Zod2Go,
    "./test/test_issues/no_id/17",
    "golang"
);

const runCase17DartSuite = createGenericTestSuite(
    "Case 17",
    case17App,
    Zod2XTranspilers.Zod2Dart,
    "./test/test_issues/no_id/17",
    "dart"
);

export const runCase17Suite = () => {
    runCase17TsSuite();
    runCase17PySuite();
    runCase17CppSuite();
    runCase17GoSuite();
    runCase17DartSuite();
};
