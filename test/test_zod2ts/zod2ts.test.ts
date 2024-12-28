import { z } from "zod";
import { ASTNodes, extendZod, Zod2Ast, Zod2Ts } from "../../dist";
extendZod(z);

import * as fs from "fs";
import { diffLinesRaw } from "jest-diff";

import { header } from "../data/header";
import { UserModel } from "../data/user_schema";
import * as schemas from "../data/zod_schemas";

let userModelQueue: ASTNodes;

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
        userModelQueue = new Zod2Ast().build(UserModel);
    });

    test("String Schema", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zString));
        const output = new Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput = "export interface ModelItem {\n" + "  item: string;\n" + "}";

        testOutput(output, expectedOutput);
    });

    test("Literal String Schema", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zLiteralString));
        const output = new Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput = "export interface ModelItem {\n" + '  item: "literal";\n' + "}";

        testOutput(output, expectedOutput);
    });

    test("Literal Number Schema", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zLiteralNumber));
        const output = new Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput = "export interface ModelItem {\n" + "  item: 1;\n" + "}";

        testOutput(output, expectedOutput);
    });

    test("Enum Schema", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zEnum));
        const output = new Zod2Ts({ indent: 2 }).transpile(ast);
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
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zNativeEnum));
        const output = new Zod2Ts({ indent: 2 }).transpile(ast);
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
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zDouble));
        const output = new Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput = "export interface ModelItem {\n" + "  item: number;\n" + "}";

        testOutput(output, expectedOutput);
    });

    test("Object Schema", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zObject));
        const output = new Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "export interface ObjectItem {\n" +
            "  key: string;\n" +
            '  discriminator: "optionA";\n' +
            "}\n\n" +
            "export interface ModelItem {\n" +
            "  item: ObjectItem;\n" +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Date Schema", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zDate));
        const output = new Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput = "export interface ModelItem {\n" + "  item: Date;\n" + "}";

        testOutput(output, expectedOutput);
    });

    test("Array Schema", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zArray2D));
        const output = new Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "export interface ModelItem {\n" + "  item: Array<number[]>;\n" + "}";

        testOutput(output, expectedOutput);
    });

    test("Record Schema", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zRecord));
        const output = new Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "export interface ModelItem {\n" + "  item: Record<string, number>;\n" + "}";

        testOutput(output, expectedOutput);
    });

    test("Map Schema", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zMap));
        const output = new Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "export interface ModelItem {\n" + "  item: Map<string, number>;\n" + "}";

        testOutput(output, expectedOutput);
    });

    test("Set Schema", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zSet));
        const output = new Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput = "export interface ModelItem {\n" + "  item: Set<string>;\n" + "}";

        testOutput(output, expectedOutput);
    });

    test("Tuple Schema", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zTuple));
        const output = new Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "export interface ModelItem {\n" + "  item: [number, number];\n" + "}";

        testOutput(output, expectedOutput);
    });

    test("Union Schema - Composite Types", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zUnion));
        const output = new Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "export interface ObjectItem {\n" +
            "  key: string;\n" +
            '  discriminator: "optionA";\n' +
            "}\n\n" +
            "export interface OtherObjectItem {\n" +
            "  key: string;\n" +
            "  otherKey: string;\n" +
            '  discriminator: "optionB";\n' +
            "}\n\n" +
            "export interface ModelItem {\n" +
            "  item: ObjectItem | OtherObjectItem;\n" +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Union Schema - without Composite Types", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zUnionWithDef));
        const output = new Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "export interface ObjectItem {\n" +
            "  key: string;\n" +
            '  discriminator: "optionA";\n' +
            "}\n\n" +
            "export interface OtherObjectItem {\n" +
            "  key: string;\n" +
            "  otherKey: string;\n" +
            '  discriminator: "optionB";\n' +
            "}\n\n" +
            "export type UnionItem = ObjectItem | OtherObjectItem;\n\n" +
            "export interface ModelItem {\n" +
            "  item: UnionItem;\n" +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Intersection Schema - Composite Types", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zIntersection));
        const output = new Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "export interface ObjectItem {\n" +
            "  key: string;\n" +
            '  discriminator: "optionA";\n' +
            "}\n\n" +
            "export interface OtherObjectItem {\n" +
            "  key: string;\n" +
            "  otherKey: string;\n" +
            '  discriminator: "optionB";\n' +
            "}\n\n" +
            "export interface ModelItem {\n" +
            "  item: ObjectItem & OtherObjectItem;\n" +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Intersection Schema - without Composite Types", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zIntersectionWithDef));
        const output = new Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput =
            "export interface ObjectItem {\n" +
            "  key: string;\n" +
            '  discriminator: "optionA";\n' +
            "}\n\n" +
            "export interface OtherObjectItem {\n" +
            "  key: string;\n" +
            "  otherKey: string;\n" +
            '  discriminator: "optionB";\n' +
            "}\n\n" +
            "export type IntersectionItem = ObjectItem & OtherObjectItem;\n\n" +
            "export interface ModelItem {\n" +
            "  item: IntersectionItem;\n" +
            "}";

        testOutput(output, expectedOutput);
    });

    test("Any Schema", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zAny));
        const output = new Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput = "export interface ModelItem {\n" + "  item: any;\n" + "}";

        testOutput(output, expectedOutput);
    });

    test("Optional Schema", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zOptional));
        const output = new Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput = "export interface ModelItem {\n" + "  item?: string;\n" + "}";

        testOutput(output, expectedOutput);
    });

    test("Nullable Schema", () => {
        const ast = new Zod2Ast().build(schemas.modelBuilder(schemas.zNullable));
        const output = new Zod2Ts({ indent: 2 }).transpile(ast);
        const expectedOutput = "export interface ModelItem {\n" + "  item: string | null;\n" + "}";

        testOutput(output, expectedOutput);
    });

    test("User Schema as interface", () => {
        const output = new Zod2Ts({ header }).transpile(userModelQueue);
        const expectedOutput = fs
            .readFileSync("./test/test_zod2ts/user_schema.expect.ts")
            .toString();

        try {
            expect(output.trim()).toBe(expectedOutput.trim());
        } catch (error) {
            diffLinesRaw(expectedOutput.split("\n"), output.split("\n"));
            fs.writeFileSync("./test/test_zod2ts/err-user_schema.ts", output);
            throw error;
        }
    });

    test("User Schema as class", () => {
        const output = new Zod2Ts({ header, outType: "class" }).transpile(userModelQueue);
        const expectedOutput = fs
            .readFileSync("./test/test_zod2ts/user_schema.expect_class.ts")
            .toString();

        try {
            expect(output.trim()).toBe(expectedOutput.trim());
        } catch (error) {
            diffLinesRaw(expectedOutput.split("\n"), output.split("\n"));
            fs.writeFileSync("./test/test_zod2ts/err-user_schema-class.ts", output);
            throw error;
        }
    });
});
