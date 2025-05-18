import { z } from "zod";
import { extendZod, Zod2XConverters } from "../../dist";
extendZod(z);

import { describe, test } from "vitest";
import * as fs from "fs";
import { zodToJsonSchema } from "zod-to-json-schema";

import { testOutput } from "../common/utils";
import { UserModel } from "./user_schema";

describe("zod2JsonSchemaDefinitions", () => {
    test("User model definitions", () => {
        const userDefinitions = Zod2XConverters.zod2JsonSchemaDefinitions(UserModel);
        const output = JSON.stringify(zodToJsonSchema(UserModel, { definitions: userDefinitions }));

        const expectedOutput = JSON.stringify(
            JSON.parse(
                fs.readFileSync("./test/test_zod2jschema_def/user_schema.json", "utf-8").toString()
            )
        );

        testOutput(output, expectedOutput);
    });
});
