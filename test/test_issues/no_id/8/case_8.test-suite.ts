import { Zod2XTranspilers } from "../../../../dist";
import { createGenericTestSuite } from "../../../common/utils";
import { case8Domain } from "./case_8";

const runCase8TsSuite = createGenericTestSuite(
    "Case 8",
    case8Domain,
    Zod2XTranspilers.Zod2Ts,
    "./test/test_issues/no_id/8"
);

const runCase8PySuite = createGenericTestSuite(
    "Case 8",
    case8Domain,
    Zod2XTranspilers.Zod2Py,
    "./test/test_issues/no_id/8",
    "python"
);

const runCase8CppSuite = createGenericTestSuite(
    "Case 8",
    case8Domain,
    Zod2XTranspilers.Zod2Cpp,
    "./test/test_issues/no_id/8",
    "cpp"
);

const runCase8GoSuite = createGenericTestSuite(
    "Case 8",
    case8Domain,
    Zod2XTranspilers.Zod2Go,
    "./test/test_issues/no_id/8",
    "golang"
);

const runCase8DartSuite = createGenericTestSuite(
    "Case 8",
    case8Domain,
    Zod2XTranspilers.Zod2Dart,
    "./test/test_issues/no_id/8",
    "dart"
);

export const runCase8Suite = () => {
    runCase8TsSuite();
    runCase8PySuite();
    runCase8CppSuite();
    runCase8GoSuite();
    runCase8DartSuite();
};
