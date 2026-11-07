import { Zod2XTranspilers } from "../../../../dist";
import { createGenericTestSuite } from "../../../common/utils";
import { case19App, case19Domain } from "./case_19";

// Both layers are tested, so the native tests can build them together.
const models: [string, unknown][] = [
    ["Case 19 domain", case19Domain],
    ["Case 19", case19App],
];

const suites = models.flatMap(([name, model]) => [
    createGenericTestSuite(name, model, Zod2XTranspilers.Zod2Ts, "./test/test_issues/no_id/19"),
    createGenericTestSuite(
        name,
        model,
        Zod2XTranspilers.Zod2Py,
        "./test/test_issues/no_id/19",
        "python"
    ),
    createGenericTestSuite(
        name,
        model,
        Zod2XTranspilers.Zod2Cpp,
        "./test/test_issues/no_id/19",
        "cpp"
    ),
]);

export const runCase19Suite = () => suites.forEach((suite) => suite());
