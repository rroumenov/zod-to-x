import { z } from "zod";
import { Zod2XTypes, extendZod, Zod2Ast, Zod2XTranspilers } from "../../dist";
extendZod(z);

import { describe, beforeAll, test } from "vitest";
import * as fs from "fs";

import { header } from "../common/header";
import { testOutput } from "../common/utils";
import { getSchemas, modelBuilder } from "../common/zod_schemas";
import { userModels, userDtos, userApi } from "../common/layered_schemas";
import { genericsApplication, genericsInfrastructure } from "../common/layered_generics";
import { zGoSupportedSchemas } from "./go_supported_schemas";
import {
    goSupportedSchemasModel,
    goSupportedSchemasApplicationModel,
} from "./go_supported_schemas.layered";

const schemas = getSchemas();

let goSupportedSchemas: Zod2XTypes.ASTNodes;

describe("Zod2Go", () => {
    beforeAll(() => {
        goSupportedSchemas = new Zod2Ast({ strict: false }).build(zGoSupportedSchemas);
    });

    test("Go supported schemas", () => {
        const output = new Zod2XTranspilers.Zod2Go({ header }).transpile(goSupportedSchemas);
        const expectedOutput = fs
            .readFileSync("./test/test_zod2go/struct-expected/go_supported_schemas.go")
            .toString();

        testOutput(
            output,
            expectedOutput,
            "./test/test_zod2go/struct-expected/err-go_supported_schemas.go"
        );
    });

    test("String Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zString));
        const output = new Zod2XTranspilers.Zod2Go({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "package models\n\n" +
            "type ModelItem struct {\n" +
            '    Item string `json:"item"`\n' +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Literal String Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zLiteralString));
        const output = new Zod2XTranspilers.Zod2Go({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "package models\n\n" +
            "type ModelItem struct {\n" +
            '    Item string `json:"item"`\n' +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Literal Number Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zLiteralNumber));
        const output = new Zod2XTranspilers.Zod2Go({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "package models\n\n" +
            "type ModelItem struct {\n" +
            '    Item int64 `json:"item"`\n' +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Enum Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zEnum));
        const output = new Zod2XTranspilers.Zod2Go({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "package models\n\n" +
            "type EnumItem string\n\n" +
            "const (\n" +
            '    EnumItemEnum1 EnumItem = "Enum1"\n' +
            '    EnumItemEnum2 EnumItem = "Enum2"\n' +
            '    EnumItemEnum3 EnumItem = "Enum3"\n' +
            ")\n\n" +
            "type ModelItem struct {\n" +
            '    Item EnumItem `json:"item"`\n' +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Native Enum Schema (mixed types)", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zNativeEnum));
        const output = new Zod2XTranspilers.Zod2Go({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "package models\n\n" +
            "type NativeEnumItem = any\n\n" +
            "// NativeEnumItem: mixed-type enum — no single Go base type available\n" +
            "const (\n" +
            "    NativeEnumItemNativeEnum1 = 1\n" +
            "    NativeEnumItemNativeEnum2 = 2\n" +
            '    NativeEnumItemNativeEnum3 = "NativeEnum3"\n' +
            ")\n\n" +
            "type ModelItem struct {\n" +
            '    Item NativeEnumItem `json:"item"`\n' +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Number (float64) Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zDouble));
        const output = new Zod2XTranspilers.Zod2Go({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "package models\n\n" +
            "type ModelItem struct {\n" +
            '    Item float64 `json:"item"`\n' +
            "}";

        testOutput(output, expectedOutput);
    });

    test("BigInt Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zBigInt));
        const output = new Zod2XTranspilers.Zod2Go({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "package models\n\n" +
            "type ModelItem struct {\n" +
            '    Item int64 `json:"item"`\n' +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Int32 Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zInt32));
        const output = new Zod2XTranspilers.Zod2Go({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "package models\n\n" +
            "type ModelItem struct {\n" +
            '    Item int32 `json:"item"`\n' +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Int64 Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zInt64));
        const output = new Zod2XTranspilers.Zod2Go({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "package models\n\n" +
            "type ModelItem struct {\n" +
            '    Item int64 `json:"item"`\n' +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Boolean Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zBoolean));
        const output = new Zod2XTranspilers.Zod2Go({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "package models\n\n" +
            "type ModelItem struct {\n" +
            '    Item bool `json:"item"`\n' +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Date Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zDate));
        const output = new Zod2XTranspilers.Zod2Go({ includeComments: false }).transpile(ast);
        const expectedOutput =
            'package models\n\nimport "time"\n\n' +
            "type ModelItem struct {\n" +
            '    Item time.Time `json:"item"`\n' +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Array Schema (2D)", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zArray2D));
        const output = new Zod2XTranspilers.Zod2Go({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "package models\n\n" +
            "type ModelItem struct {\n" +
            '    Item [][]float64 `json:"item"`\n' +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Record Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zRecord));
        const output = new Zod2XTranspilers.Zod2Go({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "package models\n\n" +
            "type ModelItem struct {\n" +
            '    Item map[string]float64 `json:"item"`\n' +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Map Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zMap));
        const output = new Zod2XTranspilers.Zod2Go({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "package models\n\n" +
            "type ModelItem struct {\n" +
            '    Item map[string]float64 `json:"item"`\n' +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Set Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zSet));
        const output = new Zod2XTranspilers.Zod2Go({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "package models\n\n" +
            "type ModelItem struct {\n" +
            '    Item map[string]struct{} `json:"item"`\n' +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Tuple Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zTuple));
        const output = new Zod2XTranspilers.Zod2Go({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "package models\n\n" +
            "type ModelItem struct {\n" +
            '    Item []any `json:"item"`\n' +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Any Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zAny));
        const output = new Zod2XTranspilers.Zod2Go({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "package models\n\n" +
            "type ModelItem struct {\n" +
            '    Item any `json:"item"`\n' +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Optional Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zOptional));
        const output = new Zod2XTranspilers.Zod2Go({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "package models\n\n" +
            "type ModelItem struct {\n" +
            '    Item *string `json:"item,omitempty"`\n' +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Nullable Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zNullable));
        const output = new Zod2XTranspilers.Zod2Go({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "package models\n\n" +
            "type ModelItem struct {\n" +
            '    Item *string `json:"item,omitempty"`\n' +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Union Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zUnion));
        const output = new Zod2XTranspilers.Zod2Go({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "package models\n\n" +
            "type ObjectItem struct {\n" +
            '    Key string `json:"key"`\n' +
            "}\n\n" +
            "type OtherObjectItem struct {\n" +
            '    OtherKey string `json:"otherKey"`\n' +
            "}\n\n" +
            "// UnionItem is a union of: ObjectItem, OtherObjectItem\n" +
            "type UnionItem = any\n\n" +
            "type ModelItem struct {\n" +
            '    Item UnionItem `json:"item"`\n' +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Intersection Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zIntersection));
        const output = new Zod2XTranspilers.Zod2Go({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "package models\n\n" +
            "type ObjectItem struct {\n" +
            '    Key string `json:"key"`\n' +
            "}\n\n" +
            "type OtherObjectItem struct {\n" +
            '    OtherKey string `json:"otherKey"`\n' +
            "}\n\n" +
            "type IntersectionItem struct {\n" +
            '    Key string `json:"key"`\n' +
            '    OtherKey string `json:"otherKey"`\n' +
            "}\n\n" +
            "type ModelItem struct {\n" +
            '    Item IntersectionItem `json:"item"`\n' +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Discriminated Union Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zDiscriminantUnion));
        const output = new Zod2XTranspilers.Zod2Go({ includeComments: false }).transpile(ast);
        const expectedOutput =
            "package models\n\n" +
            'import (\n\t"encoding/json"\n\t"fmt"\n)\n\n' +
            "type EnumItem string\n\n" +
            "const (\n" +
            '    EnumItemEnum1 EnumItem = "Enum1"\n' +
            '    EnumItemEnum2 EnumItem = "Enum2"\n' +
            '    EnumItemEnum3 EnumItem = "Enum3"\n' +
            ")\n\n" +
            "type ObjectItemWithDiscriminator struct {\n" +
            '    Key string `json:"key"`\n' +
            '    Discriminator EnumItem `json:"discriminator"`\n' +
            "}\n\n" +
            "type OtherObjectItemWithDiscriminator struct {\n" +
            '    OtherKey string `json:"otherKey"`\n' +
            '    Discriminator EnumItem `json:"discriminator"`\n' +
            "}\n\n" +
            '// DiscriminatedUnionItem is a discriminated union on "discriminator".\n' +
            "// Possible types: ObjectItemWithDiscriminator, OtherObjectItemWithDiscriminator\n" +
            "type DiscriminatedUnionItem interface {\n" +
            "    isDiscriminatedUnionItem()\n" +
            "}\n\n" +
            "func (t ObjectItemWithDiscriminator) isDiscriminatedUnionItem() {}\n\n" +
            "func (t OtherObjectItemWithDiscriminator) isDiscriminatedUnionItem() {}\n\n" +
            "// UnmarshalDiscriminatedUnionItem deserializes JSON into the correct DiscriminatedUnionItem concrete type\n" +
            '// by probing the "discriminator" discriminant field.\n' +
            "func UnmarshalDiscriminatedUnionItem(data []byte) (DiscriminatedUnionItem, error) {\n" +
            "    var probe struct {\n" +
            '        Discriminator json.RawMessage `json:"discriminator"`\n' +
            "    }\n" +
            "    if err := json.Unmarshal(data, &probe); err != nil {\n" +
            "        return nil, err\n" +
            "    }\n" +
            "    switch string(probe.Discriminator) {\n" +
            '    case `"Enum1"`:\n' +
            "        var v ObjectItemWithDiscriminator\n" +
            "        if err := json.Unmarshal(data, &v); err != nil {\n" +
            "            return nil, err\n" +
            "        }\n" +
            "        return v, nil\n" +
            '    case `"Enum2"`:\n' +
            "        var v OtherObjectItemWithDiscriminator\n" +
            "        if err := json.Unmarshal(data, &v); err != nil {\n" +
            "            return nil, err\n" +
            "        }\n" +
            "        return v, nil\n" +
            "    }\n" +
            '    return nil, fmt.Errorf("failed to deserialize DiscriminatedUnionItem: unknown discriminator %s", string(probe.Discriminator))\n' +
            "}\n\n" +
            "type ModelItem struct {\n" +
            '    Item DiscriminatedUnionItem `json:"item"`\n' +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Object with keepKeys option", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zObject));
        const output = new Zod2XTranspilers.Zod2Go({
            includeComments: false,
            keepKeys: true,
        }).transpile(ast);
        const expectedOutput =
            "package models\n\n" +
            "type ObjectItem struct {\n" +
            '    key string `json:"key"`\n' +
            "}\n\n" +
            "type ModelItem struct {\n" +
            '    item ObjectItem `json:"item"`\n' +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Custom package name", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zString));
        const output = new Zod2XTranspilers.Zod2Go({
            includeComments: false,
            packageName: "dto",
        }).transpile(ast);
        const expectedOutput =
            "package dto\n\n" +
            "type ModelItem struct {\n" +
            '    Item string `json:"item"`\n' +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Go layered modeling supported schemas - entity", () => {
        const output = goSupportedSchemasModel.transpile(
            Zod2XTranspilers.Zod2Go,
            {},
            { strict: false }
        );
        const expectedOutput = fs
            .readFileSync("./test/test_zod2go/struct-expected/go_supported_schemas_entity.go")
            .toString();

        testOutput(
            output,
            expectedOutput,
            "./test/test_zod2go/struct-expected/err-go_supported_schemas_entity.go"
        );
    });

    test("Go layered modeling supported schemas - app", () => {
        const output = goSupportedSchemasApplicationModel.transpile(
            Zod2XTranspilers.Zod2Go,
            {},
            { strict: false }
        );
        const expectedOutput = fs
            .readFileSync("./test/test_zod2go/struct-expected/go_supported_schemas_app.go")
            .toString();

        testOutput(
            output,
            expectedOutput,
            "./test/test_zod2go/struct-expected/err-go_supported_schemas_app.go"
        );
    });

    test("Go layered user entity", () => {
        const output = userModels.transpile(Zod2XTranspilers.Zod2Go, { header }, { strict: false });
        const expectedOutput = fs
            .readFileSync("./test/test_zod2go/struct-expected/user.entity.go")
            .toString();

        testOutput(output, expectedOutput, "./test/test_zod2go/struct-expected/err-user.entity.go");
    });

    test("Go layered user dtos", () => {
        const output = userDtos.transpile(Zod2XTranspilers.Zod2Go, { header }, { strict: false });
        const expectedOutput = fs
            .readFileSync("./test/test_zod2go/struct-expected/user.dtos.go")
            .toString();

        testOutput(output, expectedOutput, "./test/test_zod2go/struct-expected/err-user.dtos.go");
    });

    test("Go layered user api", () => {
        const output = userApi.transpile(Zod2XTranspilers.Zod2Go, { header }, { strict: false });
        const expectedOutput = fs
            .readFileSync("./test/test_zod2go/struct-expected/user.api.go")
            .toString();

        testOutput(output, expectedOutput, "./test/test_zod2go/struct-expected/err-user.api.go");
    });

    test("Go layered generics app", () => {
        const output = genericsApplication.transpile(
            Zod2XTranspilers.Zod2Go,
            { header },
            { strict: false }
        );
        const expectedOutput = fs
            .readFileSync("./test/test_zod2go/struct-expected/layered_generics.app.go")
            .toString();

        testOutput(
            output,
            expectedOutput,
            "./test/test_zod2go/struct-expected/err-layered_generics.app.go"
        );
    });

    test("Go layered generics infra", () => {
        const output = genericsInfrastructure.transpile(
            Zod2XTranspilers.Zod2Go,
            { header },
            { strict: false }
        );
        const expectedOutput = fs
            .readFileSync("./test/test_zod2go/struct-expected/layered_generics.infra.go")
            .toString();

        testOutput(
            output,
            expectedOutput,
            "./test/test_zod2go/struct-expected/err-layered_generics.infra.go"
        );
    });
});
