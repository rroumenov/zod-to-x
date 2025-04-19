import { z } from "zod";
import { extendZod, Zod2XConverters } from "../../dist";
extendZod(z);

import * as fs from "fs";
import { diffLinesRaw } from "jest-diff";
import { zodToJsonSchema } from "zod-to-json-schema";

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

        try {
            expect(output.trim()).toBe(expectedOutput.trim());
        } catch (error) {
            diffLinesRaw(output.split("\n"), expectedOutput.split("\n"));
            throw error;
        }
    });
});
