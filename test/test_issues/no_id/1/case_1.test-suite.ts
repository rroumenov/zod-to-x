import { Zod2XTranspilers } from "../../../../dist";
import { createGenericTestSuite } from "../../../common/utils";
import { userDtos } from "./case_1";

const runCase1TsSuite = createGenericTestSuite(
    "Case 1",
    userDtos,
    Zod2XTranspilers.Zod2Ts,
    "./test/test_issues/no_id/1"
);

const runCase1GoSuite = createGenericTestSuite(
    "Case 1",
    userDtos,
    Zod2XTranspilers.Zod2Go,
    "./test/test_issues/no_id/1",
    "golang"
);

export const runCase1Suite = () => {
    runCase1TsSuite();
    runCase1GoSuite();
};
