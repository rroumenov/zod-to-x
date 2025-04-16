import { z } from "zod";
import { Zod2XTypes, extendZod, Zod2Ast, Zod2XTranspilers } from "../../dist";
extendZod(z);

import * as fs from "fs";
import { diffLinesRaw } from "jest-diff";

import { header } from "../common/header";
import * as schemas from "../common/zod_schemas";
import { zTsSupportedSchemas } from "./ts_supported_schemas";
import {
    tsSupportedSchemasApplicationModel,
    tsSupportedSchemasModel,
} from "./ts_supported_schemas.layered";
import { userApi, userDtos, userModels } from "../common/layered_schemas";
import { userDtos as userDtosMixin } from "../common/layered_mixin_schemas";

let tsSupportedSchemas: Zod2XTypes.ASTNodes;

const testOutput = (output: string, expectedOutput: string) => {
    try {
        expect(output.trim()).toBe(expectedOutput.trim());
    } catch (error) {
        diffLinesRaw(output.split("\n"), expectedOutput.split("\n"));
        throw error;
    }
};

describe("Zod2Ts", () => {
    beforeAll(() => {
        tsSupportedSchemas = new Zod2Ast({ strict: false }).build(zTsSupportedSchemas);
    });

    test("String Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(schemas.modelBuilder(schemas.zString));
        const output = new Zod2XTranspilers.Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput = "export interface ModelItem {\n" + "  item: string;\n" + "}";

        testOutput(output, expectedOutput);
    });

    test("Literal String Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(
            schemas.modelBuilder(schemas.zLiteralString)
        );
        const output = new Zod2XTranspilers.Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput = "export interface ModelItem {\n" + '  item: "literal";\n' + "}";

        testOutput(output, expectedOutput);
    });

    test("Literal Number Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(
            schemas.modelBuilder(schemas.zLiteralNumber)
        );
        const output = new Zod2XTranspilers.Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput = "export interface ModelItem {\n" + "  item: 1;\n" + "}";

        testOutput(output, expectedOutput);
    });

    test("Enum Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(schemas.modelBuilder(schemas.zEnum));
        const output = new Zod2XTranspilers.Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "export enum EnumItem {\n" +
            '  Enum1 = "Enum1",\n' +
            '  Enum2 = "Enum2",\n' +
            '  Enum3 = "Enum3",\n' +
            "}\n\n" +
            "export interface ModelItem {\n" +
            "  item: EnumItem;\n" +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Native Enum Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(schemas.modelBuilder(schemas.zNativeEnum));
        const output = new Zod2XTranspilers.Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "export enum NativeEnumItem {\n" +
            "  NativeEnum1 = 1,\n" +
            "  NativeEnum2 = 2,\n" +
            '  NativeEnum3 = "NativeEnum3",\n' +
            "}\n\n" +
            "export interface ModelItem {\n" +
            "  item: NativeEnumItem;\n" +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Number Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(schemas.modelBuilder(schemas.zDouble));
        const output = new Zod2XTranspilers.Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput = "export interface ModelItem {\n" + "  item: number;\n" + "}";

        testOutput(output, expectedOutput);
    });

    test("Object Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(schemas.modelBuilder(schemas.zObject));
        const output = new Zod2XTranspilers.Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "export interface ObjectItem {\n" +
            "  key: string;\n" +
            "}\n\n" +
            "export interface ModelItem {\n" +
            "  item: ObjectItem;\n" +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Date Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(schemas.modelBuilder(schemas.zDate));
        const output = new Zod2XTranspilers.Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput = "export interface ModelItem {\n" + "  item: Date;\n" + "}";

        testOutput(output, expectedOutput);
    });

    test("Array Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(schemas.modelBuilder(schemas.zArray2D));
        const output = new Zod2XTranspilers.Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "export interface ModelItem {\n" + "  item: Array<number[]>;\n" + "}";

        testOutput(output, expectedOutput);
    });

    test("Record Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(schemas.modelBuilder(schemas.zRecord));
        const output = new Zod2XTranspilers.Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "export interface ModelItem {\n" + "  item: Record<string, number>;\n" + "}";

        testOutput(output, expectedOutput);
    });

    test("Map Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(schemas.modelBuilder(schemas.zMap));
        const output = new Zod2XTranspilers.Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "export interface ModelItem {\n" + "  item: Map<string, number>;\n" + "}";

        testOutput(output, expectedOutput);
    });

    test("Set Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(schemas.modelBuilder(schemas.zSet));
        const output = new Zod2XTranspilers.Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput = "export interface ModelItem {\n" + "  item: Set<string>;\n" + "}";

        testOutput(output, expectedOutput);
    });

    test("Tuple Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(schemas.modelBuilder(schemas.zTuple));
        const output = new Zod2XTranspilers.Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "export interface ModelItem {\n" + "  item: [number, number];\n" + "}";

        testOutput(output, expectedOutput);
    });

    test("Union Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(schemas.modelBuilder(schemas.zUnion));
        const output = new Zod2XTranspilers.Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "export interface ObjectItem {\n" +
            "  key: string;\n" +
            "}\n\n" +
            "export interface OtherObjectItem {\n" +
            "  otherKey: string;\n" +
            "}\n\n" +
            "export type UnionItem = ObjectItem | OtherObjectItem;\n\n" +
            "export interface ModelItem {\n" +
            "  item: UnionItem;\n" +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Intersection Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(
            schemas.modelBuilder(schemas.zIntersection)
        );
        const output = new Zod2XTranspilers.Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "export interface ObjectItem {\n" +
            "  key: string;\n" +
            "}\n\n" +
            "export interface OtherObjectItem {\n" +
            "  otherKey: string;\n" +
            "}\n\n" +
            "export type IntersectionItem = ObjectItem & OtherObjectItem;\n\n" +
            "export interface ModelItem {\n" +
            "  item: IntersectionItem;\n" +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Any Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(schemas.modelBuilder(schemas.zAny));
        const output = new Zod2XTranspilers.Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput = "export interface ModelItem {\n" + "  item: any;\n" + "}";

        testOutput(output, expectedOutput);
    });

    test("Optional Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(schemas.modelBuilder(schemas.zOptional));
        const output = new Zod2XTranspilers.Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput = "export interface ModelItem {\n" + "  item?: string;\n" + "}";

        testOutput(output, expectedOutput);
    });

    test("Nullable Schema", () => {
        const ast = new Zod2Ast({ strict: false }).build(schemas.modelBuilder(schemas.zNullable));
        const output = new Zod2XTranspilers.Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput = "export interface ModelItem {\n" + "  item: string | null;\n" + "}";

        testOutput(output, expectedOutput);
    });

    test("Typescript supported schemas - as interface", () => {
        const output = new Zod2XTranspilers.Zod2Ts({ header }).transpile(tsSupportedSchemas);
        const expectedOutput = fs
            .readFileSync(
                "./test/test_zod2ts/interface-expected/ts_supported_schemas.expect.interface.ts"
            )
            .toString();

        try {
            expect(output.trim()).toBe(expectedOutput.trim());
        } catch (error) {
            diffLinesRaw(expectedOutput.split("\n"), output.split("\n"));
            fs.writeFileSync(
                "./test/test_zod2ts/interface-expected/err-ts_supported_schemas.expect.interface.ts",
                output
            );
            throw error;
        }
    });

    test("Typescript supported schemas - as class", () => {
        const output = new Zod2XTranspilers.Zod2Ts({ header, outType: "class" }).transpile(
            tsSupportedSchemas
        );
        const expectedOutput = fs
            .readFileSync("./test/test_zod2ts/class-expected/ts_supported_schemas.expect.class.ts")
            .toString();

        try {
            expect(output.trim()).toBe(expectedOutput.trim());
        } catch (error) {
            diffLinesRaw(expectedOutput.split("\n"), output.split("\n"));
            fs.writeFileSync(
                "./test/test_zod2ts/class-expected/err-ts_supported_schemas.expect.class.ts",
                output
            );
            throw error;
        }
    });

    test("Typescript layered modeling - domain", () => {
        const output = userModels.transpile(Zod2XTranspilers.Zod2Ts, { header });
        const expectedOutput = fs
            .readFileSync("./test/test_zod2ts/interface-expected/user.entity.ts")
            .toString();

        try {
            expect(output.trim()).toBe(expectedOutput.trim());
        } catch (error) {
            diffLinesRaw(expectedOutput.split("\n"), output.split("\n"));
            fs.writeFileSync("./test/test_zod2ts/interface-expected/err-user.entity.ts", output);
            throw error;
        }
    });

    test("Typescript layered modeling - application", () => {
        const output = userDtos.transpile(Zod2XTranspilers.Zod2Ts, { header });
        const expectedOutput = fs
            .readFileSync("./test/test_zod2ts/interface-expected/user.dtos.ts")
            .toString();

        try {
            expect(output.trim()).toBe(expectedOutput.trim());
        } catch (error) {
            diffLinesRaw(expectedOutput.split("\n"), output.split("\n"));
            fs.writeFileSync("./test/test_zod2ts/interface-expected/err-user.dtos.ts", output);
            throw error;
        }
    });

    test("Typescript layered modeling - infrastructure", () => {
        const output = userApi.transpile(Zod2XTranspilers.Zod2Ts, { header });
        const expectedOutput = fs
            .readFileSync("./test/test_zod2ts/interface-expected/user.api.ts")
            .toString();

        try {
            expect(output.trim()).toBe(expectedOutput.trim());
        } catch (error) {
            diffLinesRaw(expectedOutput.split("\n"), output.split("\n"));
            fs.writeFileSync("./test/test_zod2ts/interface-expected/err-user.api.ts", output);
            throw error;
        }
    });

    test("Typescript layered modeling - domain as class", () => {
        const output = userModels.transpile(Zod2XTranspilers.Zod2Ts, { header, outType: "class" });
        const expectedOutput = fs
            .readFileSync("./test/test_zod2ts/class-expected/user.entity.ts")
            .toString();

        try {
            expect(output.trim()).toBe(expectedOutput.trim());
        } catch (error) {
            diffLinesRaw(expectedOutput.split("\n"), output.split("\n"));
            fs.writeFileSync("./test/test_zod2ts/class-expected/err-user.entity.ts", output);
            throw error;
        }
    });

    test("Typescript layered modeling - application as class", () => {
        const output = userDtos.transpile(Zod2XTranspilers.Zod2Ts, { header, outType: "class" });
        const expectedOutput = fs
            .readFileSync("./test/test_zod2ts/class-expected/user.dtos.ts")
            .toString();

        try {
            expect(output.trim()).toBe(expectedOutput.trim());
        } catch (error) {
            diffLinesRaw(expectedOutput.split("\n"), output.split("\n"));
            fs.writeFileSync("./test/test_zod2ts/class-expected/err-user.dtos.ts", output);
            throw error;
        }
    });

    test("Typescript layered modeling - infrastructure as class", () => {
        const output = userApi.transpile(Zod2XTranspilers.Zod2Ts, { header, outType: "class" });
        const expectedOutput = fs
            .readFileSync("./test/test_zod2ts/class-expected/user.api.ts")
            .toString();

        try {
            expect(output.trim()).toBe(expectedOutput.trim());
        } catch (error) {
            diffLinesRaw(expectedOutput.split("\n"), output.split("\n"));
            fs.writeFileSync("./test/test_zod2ts/class-expected/err-user.api.ts", output);
            throw error;
        }
    });

    test("Typescript layered modeling mixin - application", () => {
        const output = userDtosMixin.transpile(Zod2XTranspilers.Zod2Ts, { header });
        const expectedOutput = fs
            .readFileSync("./test/test_zod2ts/interface-expected/user.dtos.ts")
            .toString();

        try {
            expect(output.trim()).toBe(expectedOutput.trim());
        } catch (error) {
            diffLinesRaw(expectedOutput.split("\n"), output.split("\n"));
            fs.writeFileSync("./test/test_zod2ts/interface-expected/err-user.dtos.ts", output);
            throw error;
        }
    });

    test("Typescript layered modeling mixin - application as class", () => {
        const output = userDtosMixin.transpile(Zod2XTranspilers.Zod2Ts, {
            header,
            outType: "class",
        });
        const expectedOutput = fs
            .readFileSync("./test/test_zod2ts/class-expected/user.dtos.ts")
            .toString();

        try {
            expect(output.trim()).toBe(expectedOutput.trim());
        } catch (error) {
            diffLinesRaw(expectedOutput.split("\n"), output.split("\n"));
            fs.writeFileSync("./test/test_zod2ts/class-expected/err-user.dtos.ts", output);
            throw error;
        }
    });

    test("Typescript layered modeling supported schemas - entity", () => {
        const output = tsSupportedSchemasModel.transpile(
            Zod2XTranspilers.Zod2Ts,
            { header },
            { strict: false }
        );
        const expectedOutput = fs
            .readFileSync("./test/test_zod2ts/interface-expected/ts_supported_schemas.entity.ts")
            .toString();

        try {
            expect(output.trim()).toBe(expectedOutput.trim());
        } catch (error) {
            diffLinesRaw(expectedOutput.split("\n"), output.split("\n"));
            fs.writeFileSync(
                "./test/test_zod2ts/interface-expected/err-ts_supported_schemas.entity.ts",
                output
            );
            throw error;
        }
    });

    test("Typescript layered modeling supported schemas - entity as class", () => {
        const output = tsSupportedSchemasModel.transpile(
            Zod2XTranspilers.Zod2Ts,
            { header, outType: "class" },
            { strict: false }
        );
        const expectedOutput = fs
            .readFileSync("./test/test_zod2ts/class-expected/ts_supported_schemas.entity.ts")
            .toString();

        try {
            expect(output.trim()).toBe(expectedOutput.trim());
        } catch (error) {
            diffLinesRaw(expectedOutput.split("\n"), output.split("\n"));
            fs.writeFileSync(
                "./test/test_zod2ts/class-expected/err-ts_supported_schemas.entity.ts",
                output
            );
            throw error;
        }
    });

    test("Typescript layered modeling supported schemas - application", () => {
        const output = tsSupportedSchemasApplicationModel.transpile(
            Zod2XTranspilers.Zod2Ts,
            { header },
            { strict: false }
        );
        const expectedOutput = fs
            .readFileSync("./test/test_zod2ts/interface-expected/ts_supported_schemas.app.ts")
            .toString();

        try {
            expect(output.trim()).toBe(expectedOutput.trim());
        } catch (error) {
            diffLinesRaw(expectedOutput.split("\n"), output.split("\n"));
            fs.writeFileSync(
                "./test/test_zod2ts/interface-expected/err-ts_supported_schemas.app.ts",
                output
            );
            throw error;
        }
    });

    test("Typescript layered modeling supported schemas - application as class", () => {
        const output = tsSupportedSchemasApplicationModel.transpile(
            Zod2XTranspilers.Zod2Ts,
            { header, outType: "class" },
            { strict: false }
        );
        const expectedOutput = fs
            .readFileSync("./test/test_zod2ts/class-expected/ts_supported_schemas.app.ts")
            .toString();

        try {
            expect(output.trim()).toBe(expectedOutput.trim());
        } catch (error) {
            diffLinesRaw(expectedOutput.split("\n"), output.split("\n"));
            fs.writeFileSync(
                "./test/test_zod2ts/class-expected/err-ts_supported_schemas.app.ts",
                output
            );
            throw error;
        }
    });
});
