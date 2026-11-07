import { Zod2XTranspilers } from "../../../../dist";
import { createGenericTestSuite } from "../../../common/utils";
import { case12App } from "./case_12";

const runCase12TsSuite = createGenericTestSuite(
    "Case 12",
    case12App,
    Zod2XTranspilers.Zod2Ts,
    "./test/test_issues/no_id/12"
);

const runCase12PySuite = createGenericTestSuite(
    "Case 12",
    case12App,
    Zod2XTranspilers.Zod2Py,
    "./test/test_issues/no_id/12",
    "python"
);

const runCase12CppSuite = createGenericTestSuite(
    "Case 12",
    case12App,
    Zod2XTranspilers.Zod2Cpp,
    "./test/test_issues/no_id/12",
    "cpp"
);

const runCase12GoSuite = createGenericTestSuite(
    "Case 12",
    case12App,
    Zod2XTranspilers.Zod2Go,
    "./test/test_issues/no_id/12",
    "golang"
);

const runCase12DartSuite = createGenericTestSuite(
    "Case 12",
    case12App,
    Zod2XTranspilers.Zod2Dart,
    "./test/test_issues/no_id/12",
    "dart"
);

export const runCase12Suite = () => {
    runCase12TsSuite();
    runCase12PySuite();
    runCase12CppSuite();
    runCase12GoSuite();
    runCase12DartSuite();
};
