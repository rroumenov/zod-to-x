import { z } from "zod/v4";
import { describe, expect, test } from "vitest";
import { Application, Domain, extendZod, Zod2Ast, Zod2XModel, Zod2XTranspilers } from "../../dist";
extendZod(z);

const buildTs = (schema: any, strict = true) =>
    new Zod2XTranspilers.Zod2Ts().transpile(new Zod2Ast({ strict }).build(schema));

describe("Zod2X core", () => {
    describe("zod2x method", () => {
        test("Key/value overload sets metadata of schemas without previous metadata", () => {
            const schema = (z.object({ a: z.string() }) as any).zod2x("typeName", "Item");
            expect(schema._zod2x.typeName).toBe("Item");
        });
    });

    describe("Type name collisions", () => {
        test("Different schemas with the same type name raise an error", () => {
            const root = z
                .object({
                    x: z.object({ a: z.string() }).zod2x("Item"),
                    y: z.object({ b: z.number() }).zod2x("Item"),
                })
                .zod2x("Root");

            expect(() => buildTs(root)).toThrow(/Type name 'Item' is used by different schemas/);
        });

        test("Schemas with the same definition share the type", () => {
            const item = z.object({ a: z.string() }).zod2x("Item");
            const root = z
                .object({
                    x: item,
                    y: item.describe("Same definition").zod2x("Item"),
                    z: z.object({ a: z.string() }).zod2x("Item"),
                })
                .zod2x("Root");

            expect(buildTs(root)).toContain("export interface Item {");
        });

        test("Dart raises an error when a local type shares its name with an imported one", () => {
            @Domain({ namespace: "CORE_DOMAIN", file: "core_domain" })
            class CoreDomain extends Zod2XModel {
                readonly User = z.object({ id: z.string() });
            }
            const coreDomain = new CoreDomain();

            @Application({ namespace: "CORE_APP", file: "core_app" })
            class CoreApp extends Zod2XModel {
                readonly Wrapper = z.object({ domainUser: coreDomain.User });
                readonly User = z.object({ name: z.string() });
            }
            const coreApp = new CoreApp();

            expect(() => coreApp.transpile(Zod2XTranspilers.Zod2Dart)).toThrow(
                /Local types cannot share their name with imported types: User/
            );
        });
    });

    describe("Unsupported types", () => {
        const root = () => z.object({ a: z.null() }).zod2x("Root");

        test("Raise an error in strict mode", () => {
            expect(() => buildTs(root())).toThrow(/Unsupported Zod type 'null'/);
        });

        test("Are transpiled as any type in non-strict mode", () => {
            expect(buildTs(root(), false)).toContain("a: any;");
        });
    });

    describe("Layered model AST options", () => {
        test("Strict option is not ignored after a previous transpilation", () => {
            @Domain({ namespace: "CORE_STRICT", file: "core_strict" })
            class CoreStrict extends Zod2XModel {
                readonly Mixed = z.union([z.string(), z.number()]);
            }
            const coreStrict = new CoreStrict();

            expect(() =>
                coreStrict.transpile(Zod2XTranspilers.Zod2Ts, {}, { strict: false })
            ).not.toThrow();
            expect(() =>
                coreStrict.transpile(Zod2XTranspilers.Zod2Ts, {}, { strict: true })
            ).toThrow(/Union of non-object types/);
        });
    });
});
