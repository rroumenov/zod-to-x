import { Zod2XTranspilers } from "../../../../dist";
import { createGenericTestSuite } from "../../../common/utils";
import { userDtos } from "./case_1";

export const runCase1Suite = createGenericTestSuite(
    "Case 1",
    userDtos,
    Zod2XTranspilers.Zod2Ts,
    "./test/test_issues/no_id/1"
);
