import { Zod2XTranspilers } from "../../../../dist";
import { createGenericTestSuite } from "../../../common/utils";
import { case16App } from "./case_16";

const runCase16TsSuite = createGenericTestSuite(
    "Case 16",
    case16App,
    Zod2XTranspilers.Zod2Ts,
    "./test/test_issues/no_id/16"
);

const runCase16PySuite = createGenericTestSuite(
    "Case 16",
    case16App,
    Zod2XTranspilers.Zod2Py,
    "./test/test_issues/no_id/16",
    "python"
);

const runCase16CppSuite = createGenericTestSuite(
    "Case 16",
    case16App,
    Zod2XTranspilers.Zod2Cpp,
    "./test/test_issues/no_id/16",
    "cpp"
);

const runCase16GoSuite = createGenericTestSuite(
    "Case 16",
    case16App,
    Zod2XTranspilers.Zod2Go,
    "./test/test_issues/no_id/16",
    "golang"
);

const runCase16DartSuite = createGenericTestSuite(
    "Case 16",
    case16App,
    Zod2XTranspilers.Zod2Dart,
    "./test/test_issues/no_id/16",
    "dart"
);

export const runCase16Suite = () => {
    runCase16TsSuite();
    runCase16PySuite();
    runCase16CppSuite();
    runCase16GoSuite();
    runCase16DartSuite();
};
