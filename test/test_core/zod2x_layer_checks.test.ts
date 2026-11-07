import { z } from "zod/v4";
import { describe, expect, test } from "vitest";
import { Application, Domain, extendZod, Layer, Zod2XModel, Zod2XTranspilers } from "../../dist";
import { snapshotSchema } from "../common/utils";
extendZod(z);

const { Zod2Cpp, Zod2Cpp17, Zod2Dart, Zod2Go, Zod2Py, Zod2Ts } = Zod2XTranspilers;

describe("Layered model checks", () => {
    describe("Types declared by models of the same layer", () => {
        test("Raise an error in every model when they do not reference one another", () => {
            const shared = z.object({ street: z.string() });

            @Domain({ namespace: "TIE_A", file: "tie_a" })
            class TieA extends Zod2XModel {
                readonly Address = shared;
            }

            @Domain({ namespace: "TIE_B", file: "tie_b" })
            class TieB extends Zod2XModel {
                readonly Address = shared;
            }

            // Creation order is not alphabetical on purpose.
            const tieB = new TieB();
            const tieA = new TieA();

            const error =
                /Type 'Address' is declared by models of the same layer in different files \(tie_a, tie_b\)/;
            expect(() => tieA.transpile(Zod2Ts)).toThrow(error);
            expect(() => tieB.transpile(Zod2Ts)).toThrow(error);
        });

        test("Are transpiled in non-strict mode", () => {
            const shared = z.object({ street: z.string() });

            @Domain({ namespace: "TIE_LAX_A", file: "tie_lax_a" })
            class TieLaxA extends Zod2XModel {
                readonly Address = shared;
            }

            @Domain({ namespace: "TIE_LAX_B", file: "tie_lax_b" })
            class TieLaxB extends Zod2XModel {
                readonly Address = shared;
            }

            const tieLaxA = new TieLaxA();
            const tieLaxB = new TieLaxB();

            expect(tieLaxA.transpile(Zod2Ts, {}, { strict: false })).toContain(
                "export interface Address {"
            );
            expect(tieLaxB.transpile(Zod2Ts, {}, { strict: false })).toContain(
                "export interface Address extends TIE_LAX_A.Address {}"
            );
        });

        test("Are not ambiguous when used through the model that declares them", () => {
            @Domain({ namespace: "TIE_REF_A", file: "tie_ref_a" })
            class TieRefA extends Zod2XModel {
                readonly Address = z.object({ street: z.string() });
            }
            const tieRefA = new TieRefA();

            @Domain({ namespace: "TIE_REF_B", file: "tie_ref_b" })
            class TieRefB extends Zod2XModel {
                readonly Address = tieRefA.Address;
                readonly Billing = tieRefA.Address.describe("Billing address");
                readonly Strict = tieRefA.Address.strict();
                readonly Shipping = z.lazy(() => tieRefA.Address);
                readonly Customer = z.object({ address: tieRefA.Address });
            }
            const tieRefB = new TieRefB();

            const output = tieRefB.transpile(Zod2Ts);
            expect(output).toContain("export interface Address extends TIE_REF_A.Address {}");
            expect(output).toContain("export interface Billing extends TIE_REF_A.Address {}");
            expect(output).toContain("export interface Strict extends TIE_REF_A.Address {}");
            expect(output).toContain("export interface Shipping extends TIE_REF_A.Address {}");
            expect(tieRefA.transpile(Zod2Ts)).toContain("export interface Address {");
        });

        test("Are not ambiguous when the models belong to different layers", () => {
            const shared = z.object({ street: z.string() });

            @Application({ namespace: "TIE_APP", file: "tie_app" })
            class TieApp extends Zod2XModel {
                readonly Address = shared;
            }

            @Domain({ namespace: "TIE_DOMAIN", file: "tie_domain" })
            class TieDomain extends Zod2XModel {
                readonly Address = shared;
            }

            const tieApp = new TieApp();
            const tieDomain = new TieDomain();

            expect(tieDomain.transpile(Zod2Ts)).toContain("export interface Address {");
            expect(tieApp.transpile(Zod2Ts)).toContain(
                "export interface Address extends TIE_DOMAIN.Address {}"
            );
        });
    });

    describe("Layered resolution", () => {
        test("Model properties are copies of the declared schemas, which are not modified", () => {
            const address = z.object({ street: z.string() });
            const snapshot = snapshotSchema(address);

            @Domain({ namespace: "RES_COPY", file: "res_copy" })
            class ResCopy extends Zod2XModel {
                readonly Address = address;
            }
            const resCopy = new ResCopy();

            expect(resCopy.Address).not.toBe(address);
            expect(resCopy.Address.parse({ street: "Main" })).toEqual({ street: "Main" });
            expect(() => resCopy.Address.parse({})).toThrow();
            expect(resCopy.transpile(Zod2Ts)).toContain("export interface Address {");
            expect(snapshot.changes()).toEqual([]);
        });

        test("Copies of declared schemas are the same type, whenever they are created", () => {
            const shared = z.object({ id: z.string() });
            const strictShared = shared.strict();

            @Application({ namespace: "RES_COPY_APP", file: "res_copy_app" })
            class ResCopyApp extends Zod2XModel {
                readonly StrictEntity = strictShared;
                readonly LooseEntity = shared.loose();
            }

            @Domain({ namespace: "RES_COPY_DOMAIN", file: "res_copy_domain" })
            class ResCopyDomain extends Zod2XModel {
                readonly Entity = shared;
            }

            const resCopyApp = new ResCopyApp();
            const resCopyDomain = new ResCopyDomain();

            expect(resCopyDomain.transpile(Zod2Ts)).toContain("export interface Entity {");
            const output = resCopyApp.transpile(Zod2Ts);
            expect(output).toContain(
                "export interface StrictEntity extends RES_COPY_DOMAIN.Entity {}"
            );
            expect(output).toContain(
                "export interface LooseEntity extends RES_COPY_DOMAIN.Entity {}"
            );
        });

        test("Types belong to the lowest layer, whatever the creation order", () => {
            const shared = z.object({ id: z.string() });

            @Layer({ namespace: "RES_INFRA", file: "res_infra", index: 2 })
            class ResInfra extends Zod2XModel {
                readonly Entity = shared;
            }

            @Application({ namespace: "RES_APP", file: "res_app" })
            class ResApp extends Zod2XModel {
                readonly Entity = shared;
            }

            @Domain({ namespace: "RES_DOMAIN", file: "res_domain" })
            class ResDomain extends Zod2XModel {
                readonly Entity = shared;
            }

            const resInfra = new ResInfra();
            const resApp = new ResApp();
            const resDomain = new ResDomain();

            expect(resDomain.transpile(Zod2Ts)).toContain("export interface Entity {");
            expect(resApp.transpile(Zod2Ts)).toContain(
                "export interface Entity extends RES_DOMAIN.Entity {}"
            );
            expect(resInfra.transpile(Zod2Ts)).toContain(
                "export interface Entity extends RES_DOMAIN.Entity {}"
            );
        });
    });

    describe("Circular imports between layer files", () => {
        const x = z.object({ x: z.string() });
        const y = z.object({ y: z.string() });

        @Domain({ namespace: "CYC_A", file: "cyc_a" })
        class CycA extends Zod2XModel {
            readonly X = x;
            readonly UseY = z.object({ y });
        }

        @Domain({ namespace: "CYC_B", file: "cyc_b" })
        class CycB extends Zod2XModel {
            readonly Y = y;
            readonly UseX = z.object({ x });
        }

        const cycA = new CycA();
        const cycB = new CycB();

        test.each([
            ["Python", Zod2Py, {}],
            ["C++11", Zod2Cpp, {}],
            ["C++17", Zod2Cpp17, {}],
            ["Go", Zod2Go, {}],
            ["TypeScript classes", Zod2Ts, { outType: "class" }],
        ] as [string, any, any][])("Raise an error for %s", (_name, Transpiler, opt) => {
            expect(() => cycA.transpile(Transpiler, opt)).toThrow(
                /Circular import between layer files: cyc_a -> cyc_b -> cyc_a\./
            );
            expect(() => cycB.transpile(Transpiler, opt)).toThrow(
                /Circular import between layer files: cyc_b -> cyc_a -> cyc_b\./
            );
        });

        test.each([
            ["TypeScript interfaces", Zod2Ts, {}, 'import * as CYC_B from "./cyc_b";'],
            ["Dart", Zod2Dart, {}, "import './cyc_b.dart';"],
        ] as [string, any, any, string][])(
            "Are allowed for %s",
            (_name, Transpiler, opt, expectedImport) => {
                expect(cycA.transpile(Transpiler, opt)).toContain(expectedImport);
            }
        );

        test("Are transpiled in non-strict mode", () => {
            expect(cycA.transpile(Zod2Py, {}, { strict: false })).toContain(
                "import cyc_b as CYC_B"
            );
        });

        test("Are allowed when imports are not used", () => {
            expect(() => cycA.transpile(Zod2Py, { useImports: false })).not.toThrow();
        });

        test("Are not reported for one-way imports", () => {
            @Domain({ namespace: "ONE_WAY_DOMAIN", file: "one_way_domain" })
            class OneWayDomain extends Zod2XModel {
                readonly Item = z.object({ id: z.string() });
            }
            const oneWayDomain = new OneWayDomain();

            @Application({ namespace: "ONE_WAY_APP", file: "one_way_app" })
            class OneWayApp extends Zod2XModel {
                readonly Order = z.object({ item: oneWayDomain.Item });
            }
            const oneWayApp = new OneWayApp();

            expect(oneWayApp.transpile(Zod2Py)).toContain(
                "import one_way_domain as ONE_WAY_DOMAIN"
            );
            expect(() => oneWayDomain.transpile(Zod2Py)).not.toThrow();
        });
    });
});
