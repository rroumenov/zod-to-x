import { Zod2XTranspilers } from "../../../../dist";
import { createGenericTestSuite } from "../../../common/utils";
import { case7Domain } from "./case_7";

const runCase7TsSuite = createGenericTestSuite(
    "Case 7",
    case7Domain,
    Zod2XTranspilers.Zod2Ts,
    "./test/test_issues/no_id/7"
);

const runCase7PySuite = createGenericTestSuite(
    "Case 7",
    case7Domain,
    Zod2XTranspilers.Zod2Py,
    "./test/test_issues/no_id/7",
    "python"
);

const runCase7CppSuite = createGenericTestSuite(
    "Case 7",
    case7Domain,
    Zod2XTranspilers.Zod2Cpp,
    "./test/test_issues/no_id/7",
    "cpp"
);

const runCase7GoSuite = createGenericTestSuite(
    "Case 7",
    case7Domain,
    Zod2XTranspilers.Zod2Go,
    "./test/test_issues/no_id/7",
    "golang"
);

const runCase7DartSuite = createGenericTestSuite(
    "Case 7",
    case7Domain,
    Zod2XTranspilers.Zod2Dart,
    "./test/test_issues/no_id/7",
    "dart"
);

export const runCase7Suite = () => {
    runCase7TsSuite();
    runCase7PySuite();
    runCase7CppSuite();
    runCase7GoSuite();
    runCase7DartSuite();
};
