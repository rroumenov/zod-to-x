import { Zod2XTranspilers } from "../../../../dist";
import { createGenericTestSuite } from "../../../common/utils";
import { case15App } from "./case_15";

const runCase15TsSuite = createGenericTestSuite(
    "Case 15",
    case15App,
    Zod2XTranspilers.Zod2Ts,
    "./test/test_issues/no_id/15"
);

const runCase15PySuite = createGenericTestSuite(
    "Case 15",
    case15App,
    Zod2XTranspilers.Zod2Py,
    "./test/test_issues/no_id/15",
    "python"
);

const runCase15CppSuite = createGenericTestSuite(
    "Case 15",
    case15App,
    Zod2XTranspilers.Zod2Cpp,
    "./test/test_issues/no_id/15",
    "cpp"
);

const runCase15GoSuite = createGenericTestSuite(
    "Case 15",
    case15App,
    Zod2XTranspilers.Zod2Go,
    "./test/test_issues/no_id/15",
    "golang"
);

const runCase15DartSuite = createGenericTestSuite(
    "Case 15",
    case15App,
    Zod2XTranspilers.Zod2Dart,
    "./test/test_issues/no_id/15",
    "dart"
);

export const runCase15Suite = () => {
    runCase15TsSuite();
    runCase15PySuite();
    runCase15CppSuite();
    runCase15GoSuite();
    runCase15DartSuite();
};
