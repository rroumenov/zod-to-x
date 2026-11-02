import { Zod2XTranspilers } from "../../../../dist";
import { createGenericTestSuite } from "../../../common/utils";
import { case9App } from "./case_9";

const runCase9TsSuite = createGenericTestSuite(
    "Case 9",
    case9App,
    Zod2XTranspilers.Zod2Ts,
    "./test/test_issues/no_id/9"
);

const runCase9PySuite = createGenericTestSuite(
    "Case 9",
    case9App,
    Zod2XTranspilers.Zod2Py,
    "./test/test_issues/no_id/9",
    "python"
);

const runCase9CppSuite = createGenericTestSuite(
    "Case 9",
    case9App,
    Zod2XTranspilers.Zod2Cpp,
    "./test/test_issues/no_id/9",
    "cpp"
);

const runCase9GoSuite = createGenericTestSuite(
    "Case 9",
    case9App,
    Zod2XTranspilers.Zod2Go,
    "./test/test_issues/no_id/9",
    "golang"
);

export const runCase9Suite = () => {
    runCase9TsSuite();
    runCase9PySuite();
    runCase9CppSuite();
    runCase9GoSuite();
};
