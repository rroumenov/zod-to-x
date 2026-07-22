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
import { zDartSupportedSchemas } from "./dart_supported_schemas";
import {
    dartSupportedSchemasModel,
    dartSupportedSchemasApplicationModel,
} from "./dart_supported_schemas.layered";

const schemas = getSchemas();

let dartSupportedSchemas: Zod2XTypes.ASTNodes;

describe("Zod2Dart", () => {
    beforeAll(() => {
        dartSupportedSchemas = new Zod2Ast({ strict: false }).build(zDartSupportedSchemas);
    });

    test("Dart supported schemas", () => {
        const output = new Zod2XTranspilers.Zod2Dart({
            header,
            partFile: "dart_supported_schemas",
        }).transpile(dartSupportedSchemas);
        const expectedOutput = fs
            .readFileSync("./test/test_zod2dart/class-expected/dart_supported_schemas.dart")
            .toString();

        testOutput(
            output,
            expectedOutput,
            "./test/test_zod2dart/class-expected/err-dart_supported_schemas.dart"
        );
    });

    // ── Individual type tests (inline expected) ─────────────────────────────

    test("String Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zString));
        const output = new Zod2XTranspilers.Zod2Dart({ includeComments: false }).transpile(ast);
        const expectedOutput = [
            "import 'package:json_annotation/json_annotation.dart';",
            "",
            "@JsonSerializable(explicitToJson: true)",
            "class ModelItem {",
            "  final String item;",
            "",
            "  ModelItem({",
            "    required this.item,",
            "  });",
            "",
            "  factory ModelItem.fromJson(Map<String, dynamic> json) =>",
            "    _$ModelItemFromJson(json);",
            "",
            "  Map<String, dynamic> toJson() => _$ModelItemToJson(this);",
            "}",
        ].join("\n");

        testOutput(output, expectedOutput);
    });

    test("Boolean Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zBoolean));
        const output = new Zod2XTranspilers.Zod2Dart({ includeComments: false }).transpile(ast);
        const expectedOutput = [
            "import 'package:json_annotation/json_annotation.dart';",
            "",
            "@JsonSerializable(explicitToJson: true)",
            "class ModelItem {",
            "  final bool item;",
            "",
            "  ModelItem({",
            "    required this.item,",
            "  });",
            "",
            "  factory ModelItem.fromJson(Map<String, dynamic> json) =>",
            "    _$ModelItemFromJson(json);",
            "",
            "  Map<String, dynamic> toJson() => _$ModelItemToJson(this);",
            "}",
        ].join("\n");

        testOutput(output, expectedOutput);
    });

    test("Int64 Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zInt64));
        const output = new Zod2XTranspilers.Zod2Dart({ includeComments: false }).transpile(ast);
        const expectedOutput = [
            "import 'package:json_annotation/json_annotation.dart';",
            "",
            "@JsonSerializable(explicitToJson: true)",
            "class ModelItem {",
            "  final int item;",
            "",
            "  ModelItem({",
            "    required this.item,",
            "  });",
            "",
            "  factory ModelItem.fromJson(Map<String, dynamic> json) =>",
            "    _$ModelItemFromJson(json);",
            "",
            "  Map<String, dynamic> toJson() => _$ModelItemToJson(this);",
            "}",
        ].join("\n");

        testOutput(output, expectedOutput);
    });

    test("Double Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zDouble));
        const output = new Zod2XTranspilers.Zod2Dart({ includeComments: false }).transpile(ast);
        const expectedOutput = [
            "import 'package:json_annotation/json_annotation.dart';",
            "",
            "@JsonSerializable(explicitToJson: true)",
            "class ModelItem {",
            "  final double item;",
            "",
            "  ModelItem({",
            "    required this.item,",
            "  });",
            "",
            "  factory ModelItem.fromJson(Map<String, dynamic> json) =>",
            "    _$ModelItemFromJson(json);",
            "",
            "  Map<String, dynamic> toJson() => _$ModelItemToJson(this);",
            "}",
        ].join("\n");

        testOutput(output, expectedOutput);
    });

    test("Optional Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zOptional));
        const output = new Zod2XTranspilers.Zod2Dart({ includeComments: false }).transpile(ast);
        const expectedOutput = [
            "import 'package:json_annotation/json_annotation.dart';",
            "",
            "@JsonSerializable(explicitToJson: true)",
            "class ModelItem {",
            "  final String? item;",
            "",
            "  ModelItem({",
            "    this.item,",
            "  });",
            "",
            "  factory ModelItem.fromJson(Map<String, dynamic> json) =>",
            "    _$ModelItemFromJson(json);",
            "",
            "  Map<String, dynamic> toJson() => _$ModelItemToJson(this);",
            "}",
        ].join("\n");

        testOutput(output, expectedOutput);
    });

    test("Enum Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zEnum));
        const output = new Zod2XTranspilers.Zod2Dart({ includeComments: false }).transpile(ast);
        const expectedOutput = [
            "import 'package:json_annotation/json_annotation.dart';",
            "",
            "@JsonEnum(valueField: 'value')",
            "enum EnumItem {",
            "  enum1('Enum1'),",
            "  enum2('Enum2'),",
            "  enum3('Enum3');",
            "",
            "  const EnumItem(this.value);",
            "  final String value;",
            "}",
            "",
            "@JsonSerializable(explicitToJson: true)",
            "class ModelItem {",
            "  final EnumItem item;",
            "",
            "  ModelItem({",
            "    required this.item,",
            "  });",
            "",
            "  factory ModelItem.fromJson(Map<String, dynamic> json) =>",
            "    _$ModelItemFromJson(json);",
            "",
            "  Map<String, dynamic> toJson() => _$ModelItemToJson(this);",
            "}",
        ].join("\n");

        testOutput(output, expectedOutput);
    });

    test("Array 2D Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zArray2D));
        const output = new Zod2XTranspilers.Zod2Dart({ includeComments: false }).transpile(ast);
        const expectedOutput = [
            "import 'package:json_annotation/json_annotation.dart';",
            "",
            "@JsonSerializable(explicitToJson: true)",
            "class ModelItem {",
            "  final List<List<double>> item;",
            "",
            "  ModelItem({",
            "    required this.item,",
            "  });",
            "",
            "  factory ModelItem.fromJson(Map<String, dynamic> json) =>",
            "    _$ModelItemFromJson(json);",
            "",
            "  Map<String, dynamic> toJson() => _$ModelItemToJson(this);",
            "}",
        ].join("\n");

        testOutput(output, expectedOutput);
    });

    test("Map Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zMap));
        const output = new Zod2XTranspilers.Zod2Dart({ includeComments: false }).transpile(ast);
        const expectedOutput = [
            "import 'package:json_annotation/json_annotation.dart';",
            "",
            "@JsonSerializable(explicitToJson: true)",
            "class ModelItem {",
            "  final Map<String, double> item;",
            "",
            "  ModelItem({",
            "    required this.item,",
            "  });",
            "",
            "  factory ModelItem.fromJson(Map<String, dynamic> json) =>",
            "    _$ModelItemFromJson(json);",
            "",
            "  Map<String, dynamic> toJson() => _$ModelItemToJson(this);",
            "}",
        ].join("\n");

        testOutput(output, expectedOutput);
    });

    test("Set Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zSet));
        const output = new Zod2XTranspilers.Zod2Dart({ includeComments: false }).transpile(ast);
        const expectedOutput = [
            "import 'package:json_annotation/json_annotation.dart';",
            "",
            "@JsonSerializable(explicitToJson: true)",
            "class ModelItem {",
            "  final Set<String> item;",
            "",
            "  ModelItem({",
            "    required this.item,",
            "  });",
            "",
            "  factory ModelItem.fromJson(Map<String, dynamic> json) =>",
            "    _$ModelItemFromJson(json);",
            "",
            "  Map<String, dynamic> toJson() => _$ModelItemToJson(this);",
            "}",
        ].join("\n");

        testOutput(output, expectedOutput);
    });

    test("Tuple Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(modelBuilder(schemas.zTupleMulti));
        const output = new Zod2XTranspilers.Zod2Dart({ includeComments: false }).transpile(ast);
        const expectedOutput = [
            "import 'package:json_annotation/json_annotation.dart';",
            "",
            "@JsonSerializable(explicitToJson: true)",
            "class ModelItem {",
            "  final (double, String, bool) item;",
            "",
            "  ModelItem({",
            "    required this.item,",
            "  });",
            "",
            "  factory ModelItem.fromJson(Map<String, dynamic> json) =>",
            "    _$ModelItemFromJson(json);",
            "",
            "  Map<String, dynamic> toJson() => _$ModelItemToJson(this);",
            "}",
        ].join("\n");

        testOutput(output, expectedOutput);
    });

    // ── Layered modeling tests ──────────────────────────────────────────────

    test("Layered: User entity", () => {
        const output = userModels.transpile(
            Zod2XTranspilers.Zod2Dart,
            { header },
            { strict: false }
        );
        const expectedOutput = fs
            .readFileSync("./test/test_zod2dart/class-expected/user.entity.dart")
            .toString();

        testOutput(
            output,
            expectedOutput,
            "./test/test_zod2dart/class-expected/err-user.entity.dart"
        );
    });

    test("Layered: User DTOs", () => {
        const output = userDtos.transpile(Zod2XTranspilers.Zod2Dart, { header }, { strict: false });
        const expectedOutput = fs
            .readFileSync("./test/test_zod2dart/class-expected/user.dtos.dart")
            .toString();

        testOutput(
            output,
            expectedOutput,
            "./test/test_zod2dart/class-expected/err-user.dtos.dart"
        );
    });

    test("Layered: User API", () => {
        const output = userApi.transpile(Zod2XTranspilers.Zod2Dart, { header }, { strict: false });
        const expectedOutput = fs
            .readFileSync("./test/test_zod2dart/class-expected/user.api.dart")
            .toString();

        testOutput(output, expectedOutput, "./test/test_zod2dart/class-expected/err-user.api.dart");
    });

    test("Layered: DartSupportedSchemas entity", () => {
        const output = dartSupportedSchemasModel.transpile(
            Zod2XTranspilers.Zod2Dart,
            {},
            { strict: false }
        );
        const expectedOutput = fs
            .readFileSync("./test/test_zod2dart/class-expected/dart_supported_schemas_entity.dart")
            .toString();

        testOutput(
            output,
            expectedOutput,
            "./test/test_zod2dart/class-expected/err-dart_supported_schemas_entity.dart"
        );
    });

    test("Layered: DartSupportedSchemas application", () => {
        const output = dartSupportedSchemasApplicationModel.transpile(
            Zod2XTranspilers.Zod2Dart,
            {},
            { strict: false }
        );
        const expectedOutput = fs
            .readFileSync("./test/test_zod2dart/class-expected/dart_supported_schemas_app.dart")
            .toString();

        testOutput(
            output,
            expectedOutput,
            "./test/test_zod2dart/class-expected/err-dart_supported_schemas_app.dart"
        );
    });

    test("Layered: Generics Application", () => {
        const output = genericsApplication.transpile(
            Zod2XTranspilers.Zod2Dart,
            { header },
            { strict: false }
        );
        const expectedOutput = fs
            .readFileSync("./test/test_zod2dart/class-expected/layered_generics.app.dart")
            .toString();

        testOutput(
            output,
            expectedOutput,
            "./test/test_zod2dart/class-expected/err-layered_generics.app.dart"
        );
    });

    test("Layered: Generics Infrastructure", () => {
        const output = genericsInfrastructure.transpile(
            Zod2XTranspilers.Zod2Dart,
            { header },
            { strict: false }
        );
        const expectedOutput = fs
            .readFileSync("./test/test_zod2dart/class-expected/layered_generics.infra.dart")
            .toString();

        testOutput(
            output,
            expectedOutput,
            "./test/test_zod2dart/class-expected/err-layered_generics.infra.dart"
        );
    });
});
