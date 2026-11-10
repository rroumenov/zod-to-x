import { z } from "zod";
import {
    Application,
    Domain,
    extendZod,
    Infrastructure,
    Zod2XConverters,
    Zod2XModel,
    Zod2XTranspilers,
} from "../../dist";
extendZod(z);

import { describe, expect, test } from "vitest";
import * as fs from "fs";
import { zodToJsonSchema } from "zod-to-json-schema";

import { testOutput } from "../common/utils";
import { UserModel } from "./user_schema";

describe("zod2JsonSchemaDefinitions", () => {
    test("User model definitions", () => {
        const userDefinitions = Zod2XConverters.zod2JsonSchemaDefinitions(UserModel);
        const output = JSON.stringify(zodToJsonSchema(UserModel, { definitions: userDefinitions }));

        const expectedOutput = JSON.stringify(
            JSON.parse(
                fs.readFileSync("./test/test_zod2jschema_def/user_schema.json", "utf-8").toString()
            )
        );

        testOutput(output, expectedOutput);
    });
});

describe("Layered models definitions", () => {
    const build = () => {
        @Domain({ namespace: "JS_GEO", file: "js_geo" })
        class JsGeo extends Zod2XModel {
            readonly Point = z.object({ type: z.literal("Point"), coords: z.array(z.number()) });
            readonly Line = z.object({ type: z.literal("Line"), coords: z.array(z.number()) });
            readonly Kind = z.enum(["A", "B"]).describe("Base kind");
            readonly Natural = z.number().nonnegative().describe("Base natural");
            readonly Time = z.string().datetime();
            readonly Geometries = z.discriminatedUnion("type", [this.Point, this.Line]);
            readonly Described = this.Point.describe("Declared description");
            readonly Holder = z.object({
                mtom: this.Natural.describe("Field text"),
                flightTime: this.Natural.optional().describe("Optional field text"),
                natural: this.Natural,
                begin: this.Time.describe("Begin text"),
                kind: this.Kind,
                described: this.Described,
            });
        }

        return new JsGeo();
    };

    const convert = (schema: z.ZodTypeAny) =>
        zodToJsonSchema(schema, {
            definitions: Zod2XConverters.zod2JsonSchemaDefinitions(schema),
        }) as any;

    test("Uses of a type through the model and in the model reference the same definition", () => {
        const geo = build();
        const output = convert(z.object({ point: geo.Point, geometries: geo.Geometries }));

        expect(output.properties.point).toEqual({ $ref: "#/definitions/Point" });
        expect(output.definitions.Geometries.anyOf).toEqual([
            { $ref: "#/definitions/Point" },
            { $ref: "#/definitions/Line" },
        ]);
        expect(JSON.stringify(output)).not.toContain("/properties/");
    });

    test("Described uses of a type do not change its definition", () => {
        const geo = build();
        const { definitions } = convert(z.object({ holder: geo.Holder, natural: geo.Natural }));
        const holder = definitions.Holder.properties;

        expect(definitions.Natural.description).toBe("Base natural");
        expect(holder.mtom).toEqual({
            type: "number",
            minimum: 0,
            description: "Field text",
        });
        expect(holder.natural).toEqual({ $ref: "#/definitions/Natural" });
        expect(holder.flightTime).toEqual({
            $ref: "#/definitions/Natural",
            description: "Optional field text",
        });
        expect(holder.kind).toEqual({ $ref: "#/definitions/Kind" });
        expect(definitions.Time).toBeUndefined();
        expect(holder.begin).toEqual({
            type: "string",
            format: "date-time",
            description: "Begin text",
        });
    });

    test("A described schema declared by the model is a definition", () => {
        const geo = build();
        const { definitions } = convert(geo.Holder);

        expect(definitions.Described.description).toBe("Declared description");
        expect(definitions.Holder.properties.described).toEqual({
            $ref: "#/definitions/Described",
        });
    });

    test("Described copies through the model keep being the same type when transpiled", () => {
        const geo = build();
        const output = geo.transpile(Zod2XTranspilers.Zod2Ts);

        expect(output).toContain("// Field text\n    mtom: Natural;");
        expect(output).toContain(
            "// Declared description\nexport interface Described extends Point"
        );
    });

    test("Definitions take the name of the layer that owns the type, whatever the creation order", () => {
        const shared = z.object({ id: z.string() });
        const sharedEnum = z.enum(["A", "B"]);

        @Infrastructure({ namespace: "JS_ORDER_INFRA", file: "js_order_infra" })
        class JsOrderInfra extends Zod2XModel {
            readonly InfraShared = shared;
            readonly InfraEnum = sharedEnum;
        }
        new JsOrderInfra();

        @Application({ namespace: "JS_ORDER_APP", file: "js_order_app" })
        class JsOrderApp extends Zod2XModel {
            readonly AppShared = shared;
            readonly AppEnum = sharedEnum;
            readonly Dto = z.object({ a: this.AppShared, e: this.AppEnum });
        }
        const app = new JsOrderApp();

        const output = convert(z.object({ dto: app.Dto, a: app.AppShared, raw: shared }));

        expect(Object.keys(output.definitions).sort()).toEqual(["AppEnum", "AppShared", "Dto"]);
        expect(output.properties.a).toEqual({ $ref: "#/definitions/AppShared" });
        expect(output.properties.raw).toEqual({ $ref: "#/definitions/AppShared" });
    });

    test("Converting a model does not change what is transpiled, nor the declared schemas", () => {
        const point = z.object({ type: z.literal("Point") });
        const definitionOfPoint = point._def;

        @Domain({ namespace: "JS_STABLE", file: "js_stable" })
        class JsStable extends Zod2XModel {
            readonly Point = point;
            readonly Holder = z.object({ point: this.Point, doc: this.Point.describe("Doc") });
        }
        const model = new JsStable();
        const before = model.transpile(Zod2XTranspilers.Zod2Ts);

        convert(z.object({ holder: model.Holder, point: model.Point }));

        expect(model.transpile(Zod2XTranspilers.Zod2Ts)).toBe(before);
        expect(point._def).toBe(definitionOfPoint);
        expect(Object.getOwnPropertySymbols(point._def)).toEqual([]);
    });
});
