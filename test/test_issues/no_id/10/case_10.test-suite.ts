import { Zod2XTranspilers } from "../../../../dist";
import { createGenericTestSuite } from "../../../common/utils";
import { case10Domain } from "./case_10";

const runCase10TsSuite = createGenericTestSuite(
    "Case 10",
    case10Domain,
    Zod2XTranspilers.Zod2Ts,
    "./test/test_issues/no_id/10"
);

const runCase10PySuite = createGenericTestSuite(
    "Case 10",
    case10Domain,
    Zod2XTranspilers.Zod2Py,
    "./test/test_issues/no_id/10",
    "python"
);

const runCase10CppSuite = createGenericTestSuite(
    "Case 10",
    case10Domain,
    Zod2XTranspilers.Zod2Cpp,
    "./test/test_issues/no_id/10",
    "cpp"
);

const runCase10GoSuite = createGenericTestSuite(
    "Case 10",
    case10Domain,
    Zod2XTranspilers.Zod2Go,
    "./test/test_issues/no_id/10",
    "golang"
);

const runCase10DartSuite = createGenericTestSuite(
    "Case 10",
    case10Domain,
    Zod2XTranspilers.Zod2Dart,
    "./test/test_issues/no_id/10",
    "dart"
);

export const runCase10Suite = () => {
    runCase10TsSuite();
    runCase10PySuite();
    runCase10CppSuite();
    runCase10GoSuite();
    runCase10DartSuite();
};
