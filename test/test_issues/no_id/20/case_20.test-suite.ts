import { Zod2XTranspilers } from "../../../../dist";
import { createGenericTestSuite } from "../../../common/utils";
import { case20App, case20Domain } from "./case_20";

// Both layers are tested, so the native tests can build them together.
const models: [string, unknown][] = [
    ["Case 20 domain", case20Domain],
    ["Case 20", case20App],
];

const suites = models.flatMap(([name, model]) => [
    createGenericTestSuite(name, model, Zod2XTranspilers.Zod2Ts, "./test/test_issues/no_id/20"),
    createGenericTestSuite(
        name,
        model,
        Zod2XTranspilers.Zod2Py,
        "./test/test_issues/no_id/20",
        "python"
    ),
    createGenericTestSuite(
        name,
        model,
        Zod2XTranspilers.Zod2Cpp,
        "./test/test_issues/no_id/20",
        "cpp"
    ),
    createGenericTestSuite(
        name,
        model,
        Zod2XTranspilers.Zod2Go,
        "./test/test_issues/no_id/20",
        "golang"
    ),
    createGenericTestSuite(
        name,
        model,
        Zod2XTranspilers.Zod2Dart,
        "./test/test_issues/no_id/20",
        "dart"
    ),
]);

export const runCase20Suite = () => suites.forEach((suite) => suite());
