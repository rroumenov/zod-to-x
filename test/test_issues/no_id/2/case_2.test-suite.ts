import { Zod2XTranspilers } from "../../../../dist";
import { createGenericTestSuite } from "../../../common/utils";
import { userDtos } from "./case_2";

export const runCase2Suite = createGenericTestSuite(
    "Case 2",
    userDtos,
    Zod2XTranspilers.Zod2Ts,
    "./test/test_issues/no_id/2"
);
