import { Zod2XTranspilers } from "../../../../dist";
import { createGenericTestSuite } from "../../../common/utils";
import { case21App } from "./case_21";

const runCase21TsSuite = createGenericTestSuite(
    "Case 21",
    case21App,
    Zod2XTranspilers.Zod2Ts,
    "./test/test_issues/no_id/21"
);

const runCase21PySuite = createGenericTestSuite(
    "Case 21",
    case21App,
    Zod2XTranspilers.Zod2Py,
    "./test/test_issues/no_id/21",
    "python"
);

const runCase21CppSuite = createGenericTestSuite(
    "Case 21",
    case21App,
    Zod2XTranspilers.Zod2Cpp,
    "./test/test_issues/no_id/21",
    "cpp"
);

const runCase21GoSuite = createGenericTestSuite(
    "Case 21",
    case21App,
    Zod2XTranspilers.Zod2Go,
    "./test/test_issues/no_id/21",
    "golang"
);

const runCase21DartSuite = createGenericTestSuite(
    "Case 21",
    case21App,
    Zod2XTranspilers.Zod2Dart,
    "./test/test_issues/no_id/21",
    "dart"
);

export const runCase21Suite = () => {
    runCase21TsSuite();
    runCase21PySuite();
    runCase21CppSuite();
    runCase21GoSuite();
    runCase21DartSuite();
};
