import { Zod2XTranspilers } from "../../../../dist";
import { createGenericTestSuite } from "../../../common/utils";
import { case14Domain } from "./case_14";

const runCase14TsSuite = createGenericTestSuite(
    "Case 14",
    case14Domain,
    Zod2XTranspilers.Zod2Ts,
    "./test/test_issues/no_id/14"
);

const runCase14PySuite = createGenericTestSuite(
    "Case 14",
    case14Domain,
    Zod2XTranspilers.Zod2Py,
    "./test/test_issues/no_id/14",
    "python"
);

const runCase14CppSuite = createGenericTestSuite(
    "Case 14",
    case14Domain,
    Zod2XTranspilers.Zod2Cpp,
    "./test/test_issues/no_id/14",
    "cpp"
);

const runCase14GoSuite = createGenericTestSuite(
    "Case 14",
    case14Domain,
    Zod2XTranspilers.Zod2Go,
    "./test/test_issues/no_id/14",
    "golang"
);

const runCase14DartSuite = createGenericTestSuite(
    "Case 14",
    case14Domain,
    Zod2XTranspilers.Zod2Dart,
    "./test/test_issues/no_id/14",
    "dart"
);

export const runCase14Suite = () => {
    runCase14TsSuite();
    runCase14PySuite();
    runCase14CppSuite();
    runCase14GoSuite();
    runCase14DartSuite();
};
