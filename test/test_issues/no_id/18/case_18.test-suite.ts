import { Zod2XTranspilers } from "../../../../dist";
import { createGenericTestSuite } from "../../../common/utils";
import { case18Domain } from "./case_18";

const runCase18TsSuite = createGenericTestSuite(
    "Case 18",
    case18Domain,
    Zod2XTranspilers.Zod2Ts,
    "./test/test_issues/no_id/18"
);

const runCase18PySuite = createGenericTestSuite(
    "Case 18",
    case18Domain,
    Zod2XTranspilers.Zod2Py,
    "./test/test_issues/no_id/18",
    "python"
);

const runCase18CppSuite = createGenericTestSuite(
    "Case 18",
    case18Domain,
    Zod2XTranspilers.Zod2Cpp,
    "./test/test_issues/no_id/18",
    "cpp"
);

const runCase18GoSuite = createGenericTestSuite(
    "Case 18",
    case18Domain,
    Zod2XTranspilers.Zod2Go,
    "./test/test_issues/no_id/18",
    "golang"
);

const runCase18DartSuite = createGenericTestSuite(
    "Case 18",
    case18Domain,
    Zod2XTranspilers.Zod2Dart,
    "./test/test_issues/no_id/18",
    "dart"
);

export const runCase18Suite = () => {
    runCase18TsSuite();
    runCase18PySuite();
    runCase18CppSuite();
    runCase18GoSuite();
    runCase18DartSuite();
};
