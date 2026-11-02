import { z } from "zod/v4";
import { describe, expect, test } from "vitest";
import {
    Application,
    Domain,
    extendZod,
    Zod2Ast,
    Zod2XModel,
    Zod2XTranspilers,
    Zod2XTypes,
} from "../../dist";
extendZod(z);

const buildTs = (schema: any, strict = true) =>
    new Zod2XTranspilers.Zod2Ts().transpile(new Zod2Ast({ strict }).build(schema));

describe("Zod2X core", () => {
    describe("zod2x method", () => {
        test("Key/value overload sets metadata of schemas without previous metadata", () => {
            const schema = (z.object({ a: z.string() }) as any).zod2x("typeName", "Item");
            expect(buildTs(z.object({ item: schema }).zod2x("Root"))).toContain(
                "export interface Item {"
            );
        });

        test("Type name is kept by schemas cloned with describe or meta", () => {
            const role = z.enum(["Admin", "User"]).zod2x("Role").describe("User role");
            const user = z.object({ role }).zod2x("User").meta({ description: "User data" });

            const output = buildTs(z.object({ user }).zod2x("Root"));
            expect(output).toContain("export enum Role {");
            expect(output).toContain("export interface User {");
        });

        test("Schemas with a Zod id can be named", () => {
            const item = z.object({ a: z.string() }).meta({ id: "CoreItemWithId" });
            expect(() => item.zod2x("Item")).not.toThrow();
            expect(() => item.zod2x("OtherItem")).not.toThrow();
        });

        test("Literal parent enum can be set using an options object", () => {
            const kind = z.enum(["A", "B"]).zod2x("Kind");
            const variantA = z
                .object({ kind: z.literal("A").zod2x({ parentEnum: kind }), a: z.string() })
                .zod2x("VariantA");
            const variantB = z
                .object({ kind: z.literal("B").zod2x(kind), b: z.number() })
                .zod2x("VariantB");
            const root = z
                .object({ item: z.discriminatedUnion("kind", [variantA, variantB]).zod2x("Item") })
                .zod2x("Root");

            const output = buildTs(root);
            expect(output).toContain("kind: Kind.A;");
            expect(output).toContain("kind: Kind.B;");
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

    describe("Layer ownership", () => {
        test("Shared types belong to the lowest layer, regardless of the creation order", () => {
            const shared = z.object({ street: z.string() });

            @Domain({ namespace: "CORE_OWN_DOMAIN", file: "core_own_domain" })
            class CoreOwnDomain extends Zod2XModel {
                readonly Address = shared;
            }

            @Application({ namespace: "CORE_OWN_APP", file: "core_own_app" })
            class CoreOwnApp extends Zod2XModel {
                readonly Address = shared;
            }

            const coreOwnApp = new CoreOwnApp();
            const coreOwnDomain = new CoreOwnDomain();

            expect(coreOwnDomain.transpile(Zod2XTranspilers.Zod2Ts)).toContain(
                "export interface Address {"
            );
            expect(coreOwnApp.transpile(Zod2XTranspilers.Zod2Ts)).toContain(
                "export interface Address extends CORE_OWN_DOMAIN.Address {}"
            );
            expect(() => coreOwnApp.transpile(Zod2XTranspilers.Zod2Dart)).toThrow(
                /Local types cannot share their name with imported types: Address/
            );
        });
    });

    describe("Minification", () => {
        test("Output does not depend on the class names of AST nodes", () => {
            @Domain({ namespace: "CORE_MIN_DOMAIN", file: "core_min_domain" })
            class CoreMinDomain extends Zod2XModel {
                readonly Address = z.object({ street: z.string() });
            }
            const coreMinDomain = new CoreMinDomain();

            @Application({ namespace: "CORE_MIN_APP", file: "core_min_app" })
            class CoreMinApp extends Zod2XModel {
                readonly ShippingAddress = coreMinDomain.Address;
                readonly Order = z.object({
                    destination: z.lazy(() => this.ShippingAddress),
                });
            }
            const coreMinApp: any = new CoreMinApp();

            // AST is built again on each call (models cache it), so it is affected by the class
            // names of AST nodes.
            const transpile = () =>
                [Zod2XTranspilers.Zod2Dart, Zod2XTranspilers.Zod2Ts].map((Transpiler) =>
                    new Transpiler().transpile(
                        new Zod2Ast({ layer: coreMinApp.layerMetadata }).build(
                            z
                                .object({
                                    shippingAddress: coreMinApp.ShippingAddress,
                                    order: coreMinApp.Order,
                                })
                                .zod2x("CoreMinApp")
                        )
                    )
                );
            const expected = transpile();
            expect(expected[0]).toContain("@JsonKey(fromJson: _shippingAddressFromJson");

            // Simulate a minifier, which renames classes.
            const classes = Object.values(Zod2XTypes).filter(
                (i): i is Function => typeof i === "function" && /^AST[A-Z]/.test(i.name)
            );
            const names = classes.map((i) => i.name);
            classes.forEach((i) => Object.defineProperty(i, "name", { value: "e" }));

            try {
                expect(transpile()).toEqual(expected);
            } finally {
                classes.forEach((i, j) => Object.defineProperty(i, "name", { value: names[j] }));
            }
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
