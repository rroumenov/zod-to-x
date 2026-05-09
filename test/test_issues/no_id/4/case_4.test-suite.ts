import { Zod2XTranspilers } from "../../../../dist";
import { createGenericTestSuite } from "../../../common/utils";
import { errorCodesModels } from "./case_4";

const runCase4TsSuite = createGenericTestSuite(
    "Case 4",
    errorCodesModels,
    Zod2XTranspilers.Zod2Ts,
    "./test/test_issues/no_id/4"
);

const runCase4GoSuite = createGenericTestSuite(
    "Case 4",
    errorCodesModels,
    Zod2XTranspilers.Zod2Go,
    "./test/test_issues/no_id/4",
    "golang"
);

export const runCase4Suite = () => {
    runCase4TsSuite();
    runCase4GoSuite();
};
