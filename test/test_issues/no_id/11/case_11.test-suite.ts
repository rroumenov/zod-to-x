import { Zod2XTranspilers } from "../../../../dist";
import { createGenericTestSuite } from "../../../common/utils";
import { case11Domain } from "./case_11";

const runCase11TsSuite = createGenericTestSuite(
    "Case 11",
    case11Domain,
    Zod2XTranspilers.Zod2Ts,
    "./test/test_issues/no_id/11"
);

const runCase11PySuite = createGenericTestSuite(
    "Case 11",
    case11Domain,
    Zod2XTranspilers.Zod2Py,
    "./test/test_issues/no_id/11",
    "python"
);

const runCase11CppSuite = createGenericTestSuite(
    "Case 11",
    case11Domain,
    Zod2XTranspilers.Zod2Cpp,
    "./test/test_issues/no_id/11",
    "cpp"
);

const runCase11GoSuite = createGenericTestSuite(
    "Case 11",
    case11Domain,
    Zod2XTranspilers.Zod2Go,
    "./test/test_issues/no_id/11",
    "golang"
);

const runCase11DartSuite = createGenericTestSuite(
    "Case 11",
    case11Domain,
    Zod2XTranspilers.Zod2Dart,
    "./test/test_issues/no_id/11",
    "dart"
);

export const runCase11Suite = () => {
    runCase11TsSuite();
    runCase11PySuite();
    runCase11CppSuite();
    runCase11GoSuite();
    runCase11DartSuite();
};
