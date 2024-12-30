import { z } from "zod";
import { extendZod, ASTNodes, Zod2Ast, Zod2ProtoV3 } from "../../dist";
extendZod(z);

import * as fs from "fs";
import { diffLinesRaw } from "jest-diff";
import * as pb from "protobufjs";

import { header } from "../common/header";
import * as schemas from "../common/zod_schemas";
import { zProto3SupportedSchemas } from "./proto3_supported_schemas";

let proto3SupportedSchemas: ASTNodes;

const testOutput = (output: string, expectedOutput: string) => {
    try {
        expect(output.trim()).toBe(expectedOutput.trim());
    } catch (error) {
        diffLinesRaw(output.split("\n"), expectedOutput.split("\n"));
        throw error;
    }
};

describe("Zod2Proto3", () => {
    beforeAll(() => {
        proto3SupportedSchemas = new Zod2Ast().build(zProto3SupportedSchemas);
    });

    test("String Schema", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zString));
        const output = new Zod2ProtoV3({ indent: 2 }).transpile(ast);
        const expectedOutput =
            'syntax = "proto3";\n\n' + "message ModelItem {\n" + "  string item = 1;\n" + "}\n";

        testOutput(output, expectedOutput);
    });

    test("Literal String Schema", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zLiteralString));
        const output = new Zod2ProtoV3({ indent: 2 }).transpile(ast);
        const expectedOutput =
            'syntax = "proto3";\n\n' + "message ModelItem {\n" + "  string item = 1;\n" + "}\n";

        testOutput(output, expectedOutput);
    });

    test("Literal Number Schema", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zLiteralNumber));
        const output = new Zod2ProtoV3({ indent: 2 }).transpile(ast);
        const expectedOutput =
            'syntax = "proto3";\n\n' + "message ModelItem {\n" + "  uint32 item = 1;\n" + "}\n";

        testOutput(output, expectedOutput);
    });

    test("Enum Schema", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zEnum));
        const output = new Zod2ProtoV3({ indent: 2 }).transpile(ast);
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
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zNativeEnum));
        const output = new Zod2ProtoV3({ indent: 2 }).transpile(ast);
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
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zDouble));
        const output = new Zod2ProtoV3({ indent: 2 }).transpile(ast);
        const expectedOutput =
            'syntax = "proto3";\n\n' + "message ModelItem {\n" + "  double item = 1;\n" + "}\n";

        testOutput(output, expectedOutput);
    });

    test("Number Schema as BigInt", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zBigInt));
        const output = new Zod2ProtoV3({ indent: 2 }).transpile(ast);
        const expectedOutput =
            'syntax = "proto3";\n\n' + "message ModelItem {\n" + "  int64 item = 1;\n" + "}\n";

        testOutput(output, expectedOutput);
    });

    test("Number Schema as Int64", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zInt64));
        const output = new Zod2ProtoV3({ indent: 2 }).transpile(ast);
        const expectedOutput =
            'syntax = "proto3";\n\n' + "message ModelItem {\n" + "  int64 item = 1;\n" + "}\n";

        testOutput(output, expectedOutput);
    });

    test("Number Schema as Int32", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zInt32));
        const output = new Zod2ProtoV3({ indent: 2 }).transpile(ast);
        const expectedOutput =
            'syntax = "proto3";\n\n' + "message ModelItem {\n" + "  int32 item = 1;\n" + "}\n";

        testOutput(output, expectedOutput);
    });

    test("Boolean Schema", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zBoolean));
        const output = new Zod2ProtoV3({ indent: 2 }).transpile(ast);
        const expectedOutput =
            'syntax = "proto3";\n\n' + "message ModelItem {\n" + "  bool item = 1;\n" + "}\n";

        testOutput(output, expectedOutput);
    });

    test("Object Schema", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zObject));
        const output = new Zod2ProtoV3({ indent: 2 }).transpile(ast);
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
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zDate));
        const output = new Zod2ProtoV3({ indent: 2 }).transpile(ast);
        const expectedOutput =
            'syntax = "proto3";\n\n' +
            'import "google/protobuf/timestamp.proto";\n\n' +
            "message ModelItem {\n" +
            "  google.protobuf.Timestamp item = 1;\n" +
            "}\n";

        testOutput(output, expectedOutput);
    });

    test("Array Schema", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zArray1D));
        const output = new Zod2ProtoV3({ indent: 2 }).transpile(ast);
        const expectedOutput =
            'syntax = "proto3";\n\n' +
            "message ModelItem {\n" +
            "  repeated double item = 1;\n" +
            "}\n";

        testOutput(output, expectedOutput);
    });

    test("Record Schema", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zRecord));
        const output = new Zod2ProtoV3({ indent: 2 }).transpile(ast);
        const expectedOutput =
            'syntax = "proto3";\n\n' +
            "message ModelItem {\n" +
            "  map<string, double> item = 1;\n" +
            "}\n";

        testOutput(output, expectedOutput);
    });

    test("Map Schema", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zMap));
        const output = new Zod2ProtoV3({ indent: 2 }).transpile(ast);
        const expectedOutput =
            'syntax = "proto3";\n\n' +
            "message ModelItem {\n" +
            "  map<string, double> item = 1;\n" +
            "}\n";

        testOutput(output, expectedOutput);
    });

    test("Set Schema", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zSet));
        const output = new Zod2ProtoV3({ indent: 2 }).transpile(ast);
        const expectedOutput =
            'syntax = "proto3";\n\n' +
            "message ModelItem {\n" +
            "  repeated string item = 1;\n" +
            "}\n";

        testOutput(output, expectedOutput);
    });

    test("Tuple Schema", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zTuple));
        const output = new Zod2ProtoV3({ indent: 2 }).transpile(ast);
        const expectedOutput =
            'syntax = "proto3";\n\n' +
            "message ModelItem {\n" +
            "  repeated double item = 1;\n" +
            "}\n";

        testOutput(output, expectedOutput);
    });

    test("Union Schema", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zUnionWithDef));
        const output = new Zod2ProtoV3({ indent: 2 }).transpile(ast);
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
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zAny));
        const output = new Zod2ProtoV3({ indent: 2 }).transpile(ast);
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

        const output = new Zod2ProtoV3({
            header,
            packageName: "supportedschemas",
        }).transpile(proto3SupportedSchemas);
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
        pb.loadSync("./test/test_zod2proto3/proto3_supported_schemas.expect.camel.proto");

        const output = new Zod2ProtoV3({
            header,
            packageName: "supportedschemas",
            useCamelCase: true,
        }).transpile(proto3SupportedSchemas);
        const expectedOutput = fs
            .readFileSync("./test/test_zod2proto3/proto3_supported_schemas.expect.camel.proto")
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
