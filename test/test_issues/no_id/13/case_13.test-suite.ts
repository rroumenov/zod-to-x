import { Zod2XTranspilers } from "../../../../dist";
import { createGenericTestSuite } from "../../../common/utils";
import { case13Domain } from "./case_13";

const runCase13TsSuite = createGenericTestSuite(
    "Case 13",
    case13Domain,
    Zod2XTranspilers.Zod2Ts,
    "./test/test_issues/no_id/13"
);

const runCase13PySuite = createGenericTestSuite(
    "Case 13",
    case13Domain,
    Zod2XTranspilers.Zod2Py,
    "./test/test_issues/no_id/13",
    "python"
);

const runCase13CppSuite = createGenericTestSuite(
    "Case 13",
    case13Domain,
    Zod2XTranspilers.Zod2Cpp,
    "./test/test_issues/no_id/13",
    "cpp"
);

const runCase13GoSuite = createGenericTestSuite(
    "Case 13",
    case13Domain,
    Zod2XTranspilers.Zod2Go,
    "./test/test_issues/no_id/13",
    "golang"
);

const runCase13DartSuite = createGenericTestSuite(
    "Case 13",
    case13Domain,
    Zod2XTranspilers.Zod2Dart,
    "./test/test_issues/no_id/13",
    "dart"
);

export const runCase13Suite = () => {
    runCase13TsSuite();
    runCase13PySuite();
    runCase13CppSuite();
    runCase13GoSuite();
    runCase13DartSuite();
};
