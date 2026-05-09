import { Zod2XTranspilers } from "../../../../dist";
import { createGenericTestSuite } from "../../../common/utils";
import { case6App } from "./case_6";

const runCase6TsSuite = createGenericTestSuite(
    "Case 6",
    case6App,
    Zod2XTranspilers.Zod2Ts,
    "./test/test_issues/no_id/6"
);

const runCase6PySuite = createGenericTestSuite(
    "Case 6",
    case6App,
    Zod2XTranspilers.Zod2Py,
    "./test/test_issues/no_id/6",
    "python"
);

const runCase6CppSuite = createGenericTestSuite(
    "Case 6",
    case6App,
    Zod2XTranspilers.Zod2Cpp,
    "./test/test_issues/no_id/6",
    "cpp"
);

const runCase6GoSuite = createGenericTestSuite(
    "Case 6",
    case6App,
    Zod2XTranspilers.Zod2Go,
    "./test/test_issues/no_id/6",
    "golang"
);

export const runCase6Suite = () => {
    runCase6TsSuite();
    runCase6PySuite();
    runCase6CppSuite();
    runCase6GoSuite();
};
