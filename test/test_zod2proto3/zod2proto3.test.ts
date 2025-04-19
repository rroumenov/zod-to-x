import { z } from "zod";
import { extendZod, Zod2XConverters } from "../../dist";
extendZod(z);

import * as fs from "fs";
import { diffLinesRaw } from "jest-diff";
import * as pb from "protobufjs";

import { header } from "../common/header";
import * as schemas from "../common/zod_schemas";
import { zProto3SupportedSchemas } from "./proto3_supported_schemas";

const testOutput = (output: string, expectedOutput: string) => {
    try {
        expect(output.trim()).toBe(expectedOutput.trim());
    } catch (error) {
        diffLinesRaw(output.split("\n"), expectedOutput.split("\n"));
        throw error;
    }
};

describe("Zod2Proto3", () => {
    test("String Schema", () => {
        const output = Zod2XConverters.zod2ProtoV3(schemas.modelBuilder(schemas.zString), {
            indent: 2,
            strict: false,
        });
        const expectedOutput =
            'syntax = "proto3";\n\n' + "message ModelItem {\n" + "  string item = 1;\n" + "}\n";

        testOutput(output, expectedOutput);
    });

    test("Literal String Schema", () => {
        const output = Zod2XConverters.zod2ProtoV3(schemas.modelBuilder(schemas.zLiteralString), {
            indent: 2,
            strict: false,
        });
        const expectedOutput =
            'syntax = "proto3";\n\n' + "message ModelItem {\n" + "  string item = 1;\n" + "}\n";

        testOutput(output, expectedOutput);
    });

    test("Literal Number Schema", () => {
        const output = Zod2XConverters.zod2ProtoV3(schemas.modelBuilder(schemas.zLiteralNumber), {
            indent: 2,
            strict: false,
        });
        const expectedOutput =
            'syntax = "proto3";\n\n' + "message ModelItem {\n" + "  uint32 item = 1;\n" + "}\n";

        testOutput(output, expectedOutput);
    });

    test("Enum Schema", () => {
        const output = Zod2XConverters.zod2ProtoV3(schemas.modelBuilder(schemas.zEnum), {
            indent: 2,
            strict: false,
        });
        const expectedOutput =
            'syntax = "proto3";\n\n' +
            "enum EnumItem {\n" +
            "  Enum1 = 0;\n" +
            "  Enum2 = 1;\n" +
            "  Enum3 = 2;\n" +
            "}\n\n" +
            "message ModelItem {\n" +
            "  EnumItem item = 1;\n" +
            "}\n";

        testOutput(output, expectedOutput);
    });

    test("Native Enum Schema", () => {
        const output = Zod2XConverters.zod2ProtoV3(schemas.modelBuilder(schemas.zNativeEnum), {
            indent: 2,
            strict: false,
        });
        const expectedOutput =
            'syntax = "proto3";\n\n' +
            "enum NativeEnumItem {\n" +
            "  NativeEnum1 = 0;\n" +
            "  NativeEnum2 = 1;\n" +
            "  NativeEnum3 = 2;\n" +
            "}\n\n" +
            "message ModelItem {\n" +
            "  NativeEnumItem item = 1;\n" +
            "}\n";

        testOutput(output, expectedOutput);
    });

    test("Number Schema as Double", () => {
        const output = Zod2XConverters.zod2ProtoV3(schemas.modelBuilder(schemas.zDouble), {
            indent: 2,
            strict: false,
        });
        const expectedOutput =
            'syntax = "proto3";\n\n' + "message ModelItem {\n" + "  double item = 1;\n" + "}\n";

        testOutput(output, expectedOutput);
    });

    test("Number Schema as BigInt", () => {
        const output = Zod2XConverters.zod2ProtoV3(schemas.modelBuilder(schemas.zBigInt), {
            indent: 2,
            strict: false,
        });
        const expectedOutput =
            'syntax = "proto3";\n\n' + "message ModelItem {\n" + "  int64 item = 1;\n" + "}\n";

        testOutput(output, expectedOutput);
    });

    test("Number Schema as Int64", () => {
        const output = Zod2XConverters.zod2ProtoV3(schemas.modelBuilder(schemas.zInt64), {
            indent: 2,
            strict: false,
        });
        const expectedOutput =
            'syntax = "proto3";\n\n' + "message ModelItem {\n" + "  int64 item = 1;\n" + "}\n";

        testOutput(output, expectedOutput);
    });

    test("Number Schema as Int32", () => {
        const output = Zod2XConverters.zod2ProtoV3(schemas.modelBuilder(schemas.zInt32), {
            indent: 2,
            strict: false,
        });
        const expectedOutput =
            'syntax = "proto3";\n\n' + "message ModelItem {\n" + "  int32 item = 1;\n" + "}\n";

        testOutput(output, expectedOutput);
    });

    test("Boolean Schema", () => {
        const output = Zod2XConverters.zod2ProtoV3(schemas.modelBuilder(schemas.zBoolean), {
            indent: 2,
            strict: false,
        });
        const expectedOutput =
            'syntax = "proto3";\n\n' + "message ModelItem {\n" + "  bool item = 1;\n" + "}\n";

        testOutput(output, expectedOutput);
    });

    test("Object Schema", () => {
        const output = Zod2XConverters.zod2ProtoV3(schemas.modelBuilder(schemas.zObject), {
            indent: 2,
            strict: false,
        });
        const expectedOutput =
            'syntax = "proto3";\n\n' +
            "message ObjectItem {\n" +
            "  string key = 1;\n" +
            "}\n\n" +
            "message ModelItem {\n" +
            "  ObjectItem item = 1;\n" +
            "}\n";

        testOutput(output, expectedOutput);
    });

    test("Date Schema", () => {
        const output = Zod2XConverters.zod2ProtoV3(schemas.modelBuilder(schemas.zDate), {
            indent: 2,
            strict: false,
        });
        const expectedOutput =
            'syntax = "proto3";\n\n' +
            'import "google/protobuf/timestamp.proto";\n\n' +
            "message ModelItem {\n" +
            "  google.protobuf.Timestamp item = 1;\n" +
            "}\n";

        testOutput(output, expectedOutput);
    });

    test("Array Schema", () => {
        const output = Zod2XConverters.zod2ProtoV3(schemas.modelBuilder(schemas.zArray1D), {
            indent: 2,
            strict: false,
        });
        const expectedOutput =
            'syntax = "proto3";\n\n' +
            "message ModelItem {\n" +
            "  repeated double item = 1;\n" +
            "}\n";

        testOutput(output, expectedOutput);
    });

    test("Record Schema", () => {
        const output = Zod2XConverters.zod2ProtoV3(schemas.modelBuilder(schemas.zRecord), {
            indent: 2,
            strict: false,
        });
        const expectedOutput =
            'syntax = "proto3";\n\n' +
            "message ModelItem {\n" +
            "  map<string, double> item = 1;\n" +
            "}\n";

        testOutput(output, expectedOutput);
    });

    test("Map Schema", () => {
        const output = Zod2XConverters.zod2ProtoV3(schemas.modelBuilder(schemas.zMap), {
            indent: 2,
            strict: false,
        });
        const expectedOutput =
            'syntax = "proto3";\n\n' +
            "message ModelItem {\n" +
            "  map<string, double> item = 1;\n" +
            "}\n";

        testOutput(output, expectedOutput);
    });

    test("Set Schema", () => {
        const output = Zod2XConverters.zod2ProtoV3(schemas.modelBuilder(schemas.zSet), {
            indent: 2,
            strict: false,
        });
        const expectedOutput =
            'syntax = "proto3";\n\n' +
            "message ModelItem {\n" +
            "  repeated string item = 1;\n" +
            "}\n";

        testOutput(output, expectedOutput);
    });

    test("Tuple Schema", () => {
        const output = Zod2XConverters.zod2ProtoV3(schemas.modelBuilder(schemas.zTuple), {
            indent: 2,
            strict: false,
        });
        const expectedOutput =
            'syntax = "proto3";\n\n' +
            "message ModelItem {\n" +
            "  repeated double item = 1;\n" +
            "}\n";

        testOutput(output, expectedOutput);
    });

    test("Union Schema", () => {
        const output = Zod2XConverters.zod2ProtoV3(schemas.modelBuilder(schemas.zUnion), {
            indent: 2,
            strict: false,
        });
        const expectedOutput =
            'syntax = "proto3";\n\n' +
            "message ObjectItem {\n" +
            "  string key = 1;\n" +
            "}\n\n" +
            "message OtherObjectItem {\n" +
            "  string other_key = 1;\n" +
            "}\n\n" +
            "message UnionItem {\n" +
            "  oneof union_item_oneof {\n" +
            "    ObjectItem object_item = 1;\n" +
            "    OtherObjectItem other_object_item = 2;\n" +
            "  }\n" +
            "}\n\n" +
            "message ModelItem {\n" +
            "  UnionItem item = 1;\n" +
            "}\n";

        testOutput(output, expectedOutput);
    });

    test("Any Schema", () => {
        const output = Zod2XConverters.zod2ProtoV3(schemas.modelBuilder(schemas.zAny), {
            indent: 2,
            strict: false,
        });
        const expectedOutput =
            'syntax = "proto3";\n\n' +
            'import "google/protobuf/any.proto";\n\n' +
            "message ModelItem {\n" +
            "  google.protobuf.Any item = 1;\n" +
            "}\n";

        testOutput(output, expectedOutput);
    });

    test("Protobuf V3 supported schemas", () => {
        // Validate that expected proto file is a valid one.
        pb.loadSync("./test/test_zod2proto3/proto3_supported_schemas.expect.proto");

        const output = Zod2XConverters.zod2ProtoV3(zProto3SupportedSchemas, {
            strict: false,
            header,
            packageName: "supportedschemas",
        });
        const expectedOutput = fs
            .readFileSync("./test/test_zod2proto3/proto3_supported_schemas.expect.proto")
            .toString();

        try {
            expect(output.trim()).toBe(expectedOutput.trim());
        } catch (error) {
            diffLinesRaw(output.split("\n"), expectedOutput.split("\n"));
            fs.writeFileSync(
                "./test/test_zod2proto3/err-proto3_supported_schemas.expect.proto",
                output
            );
            throw error;
        }
    });

    test("Protobuf V3 supported schemas - as camelCase", () => {
        // Validate that expected proto file is a valid one.
        pb.loadSync("test/test_zod2proto3/proto3_supported_schemas.expect.keep-keys.proto");

        const output = Zod2XConverters.zod2ProtoV3(zProto3SupportedSchemas, {
            strict: false,
            header,
            packageName: "supportedschemas",
            keepKeys: true,
        });
        const expectedOutput = fs
            .readFileSync("test/test_zod2proto3/proto3_supported_schemas.expect.keep-keys.proto")
            .toString();

        try {
            expect(output.trim()).toBe(expectedOutput.trim());
        } catch (error) {
            diffLinesRaw(output.split("\n"), expectedOutput.split("\n"));
            fs.writeFileSync(
                "./test/test_zod2proto3/err-proto3_supported_schemas.expect.camel.proto",
                output
            );
            throw error;
        }
    });
});
