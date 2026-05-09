import { describe, test } from "vitest";
import { Zod2XConverters } from "../../../../dist";
import { testOutput } from "../../../common/utils";
import { weatherServiceApi } from "./case_5";

export const runCase5Suite = () => {
    describe("Case 5", () => {
        test("Protobuf skips aliased basic types from layered modeling", () => {
            const output = Zod2XConverters.zod2ProtoV3(weatherServiceApi.ResGetWeather as any, {
                indent: 2,
                includeComments: false,
            });

            const expectedOutput = [
                'syntax = "proto3";',
                "",
                'import "google/protobuf/any.proto";',
                "",
                "message ResGetWeather {",
                "  string weather_id = 1;",
                "  google.protobuf.Any data = 2;",
                "}",
            ].join("\n");

            testOutput(output, expectedOutput);
        });
    });
};
