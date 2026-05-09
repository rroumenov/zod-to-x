import { Zod2XTranspilers } from "../../../../dist";
import { createGenericTestSuite } from "../../../common/utils";
import { userDtos } from "./case_2";

const runCase2TsSuite = createGenericTestSuite(
    "Case 2",
    userDtos,
    Zod2XTranspilers.Zod2Ts,
    "./test/test_issues/no_id/2"
);

const runCase2GoSuite = createGenericTestSuite(
    "Case 2",
    userDtos,
    Zod2XTranspilers.Zod2Go,
    "./test/test_issues/no_id/2",
    "golang"
);

export const runCase2Suite = () => {
    runCase2TsSuite();
    runCase2GoSuite();
};
