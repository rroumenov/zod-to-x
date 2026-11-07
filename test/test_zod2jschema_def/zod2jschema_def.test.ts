/**
 * Behaviour of zod2JsonSchemaDefinitions: which schemas are definitions, how they are referenced,
 * and which metadata they have. The assertions do not depend on how each Zod version represents
 * the types (e.g. Zod 4.5+ extracts a root with a type name into the definitions), and every JSON
 * Schema is also checked with `findProblems` (valid, same data and annotations as Zod).
 */
import { z } from "zod/v4";
import { createGenericType, extendZod, useGenericType, Zod2XConverters } from "../../dist";
extendZod(z);

import * as fs from "fs";
import { beforeEach, describe, expect, test } from "vitest";

import { userApi, userDtos, userModels } from "../common/layered_schemas";
import { tsSupportedSchemasModel } from "../test_zod2ts/ts_supported_schemas.layered";
import {
    compile,
    definitionsKey,
    findProblems,
    getMutations,
    forEachSchema,
    getDefinitions,
    getReferences,
    getRootDefinition,
    isZodSupported,
    JsonSchema,
    refTo,
    Target,
    TARGETS,
    toJsonSchema,
    toZodJsonSchema,
    withoutIds,
} from "./json_schema_checks";
import { UserModel } from "./user_schema";

/** Checks the JSON Schemas of a schema for all the targets. */
const expectValid = (schema: z.ZodType, params: Parameters<typeof toJsonSchema>[1] = {}) => {
    for (const target of TARGETS) {
        expect([target, findProblems(schema, target, params)]).toEqual([target, []]);
    }
};

const definitionNames = (output: JsonSchema, target: Target = "draft-2020-12") =>
    Object.keys(getDefinitions(output, target)).sort();

/** Definitions named by zod-to-x (Zod names other extracted schemas `__schema<N>`). */
const namedDefinitions = (output: JsonSchema, target: Target = "draft-2020-12") =>
    definitionNames(output, target).filter((name) => !name.startsWith("__schema"));

/** Names of the definitions plus the root, if it is not extracted (Zod < 4.5). */
const typeNames = (output: JsonSchema, root: string, target: Target = "draft-2020-12") =>
    [...new Set([...namedDefinitions(output, target), root])].sort();

const properties = (output: JsonSchema, target: Target = "draft-2020-12") =>
    getRootDefinition(output, target).properties;

/** Whether a JSON Schema is only a reference (draft-07 references schemas that are not
 * definitions with `allOf`). */
const isOnlyReference = (node: JsonSchema, name: string, target: Target = "draft-2020-12") =>
    JSON.stringify(node) === JSON.stringify({ $ref: refTo(name, target) }) ||
    JSON.stringify(node) === JSON.stringify({ allOf: [{ $ref: refTo(name, target) }] });

const Address = () => z.object({ street: z.string() }).describe("An address").zod2x("Address");
const Status = () => z.enum(["active", "inactive"]).describe("A status").zod2x("Status");

describe.runIf(isZodSupported)("zod2JsonSchemaDefinitions", () => {
    describe("Definitions", () => {
        test("Schemas with a type name are definitions referenced with $ref", () => {
            const A = z.object({ a: z.string() }).zod2x("A");
            const B = z.object({ type: z.literal("b"), b: z.number() }).zod2x("B");
            const C = z.object({ type: z.literal("c"), c: z.boolean() }).zod2x("C");
            const schema = z
                .object({
                    object: A,
                    enumeration: Status(),
                    union: z.union([z.string(), z.number()]).zod2x("StringOrNumber"),
                    discriminated: z.discriminatedUnion("type", [B, C]).zod2x("BOrC"),
                    intersection: z.intersection(A, z.object({ x: z.string() })).zod2x("AWithX"),
                })
                .zod2x("Root");

            const output = toJsonSchema(schema);

            expect(typeNames(output, "Root")).toEqual(
                ["A", "AWithX", "B", "BOrC", "C", "Root", "Status", "StringOrNumber"].sort()
            );
            expect(properties(output)).toEqual({
                object: { $ref: refTo("A") },
                enumeration: { $ref: refTo("Status") },
                union: { $ref: refTo("StringOrNumber") },
                discriminated: { $ref: refTo("BOrC") },
                intersection: { $ref: refTo("AWithX") },
            });
            expect(getReferences(getDefinitions(output).BOrC)).toEqual(["B", "C"]);
            expect(getDefinitions(output).A).toEqual({
                type: "object",
                properties: { a: { type: "string" } },
                required: ["a"],
                additionalProperties: false,
            });
            expectValid(schema);
        });

        test("Schemas without type names are the same as in Zod JSON Schemas", () => {
            const schemas = [
                z.object({ a: z.string(), b: z.array(z.number()).optional() }),
                z.enum(["a", "b"]).describe("An enum"),
                z.union([z.object({ a: z.string() }), z.null()]),
                z.intersection(z.object({ a: z.string() }), z.object({ b: z.number() })),
                z.object({ a: z.object({ b: z.object({ c: z.string() }) }) }).strict(),
            ];

            for (const schema of schemas) {
                for (const target of TARGETS) {
                    expect(toJsonSchema(schema, { target })).toEqual(
                        z.toJSONSchema(schema, { target })
                    );
                }
            }
        });

        test("A root with a type name is a definition", () => {
            const output = toJsonSchema(Address());
            const root = getRootDefinition(output);

            expect(root).toEqual({
                type: "object",
                properties: { street: { type: "string" } },
                required: ["street"],
                additionalProperties: false,
                description: "An address",
            });
            if (output.$ref !== undefined) {
                expect(output.$ref).toBe(refTo("Address"));
            }
        });

        test("A root without a type name is inlined with the definitions it uses", () => {
            const output = toJsonSchema(z.object({ address: Address() }));

            expect(output.$ref).toBeUndefined();
            expect(output.properties).toEqual({ address: { $ref: refTo("Address") } });
            expect(definitionNames(output)).toEqual(["Address"]);
        });

        test("Wrappers of schemas with a type name reference their definition", () => {
            const address = Address();
            const status = Status();
            const schema = z
                .object({
                    optional: address.optional(),
                    nullable: address.nullable(),
                    array: z.array(address),
                    record: z.record(z.string(), address),
                    tuple: z.tuple([address, status]),
                    readonly: address.readonly(),
                    withDefault: status.default("active"),
                    lazy: z.lazy(() => address),
                    union: z.union([address, status]),
                })
                .zod2x("Root");

            const output = toJsonSchema(schema);
            const rootProperties = properties(output);

            expect(typeNames(output, "Root")).toEqual(["Address", "Root", "Status"]);
            for (const [name, property] of Object.entries<any>(rootProperties)) {
                expect([name, getReferences(property)]).toEqual([
                    name,
                    name === "tuple" || name === "union"
                        ? ["Address", "Status"]
                        : name === "withDefault"
                          ? ["Status"]
                          : ["Address"],
                ]);
            }
            expect(rootProperties.array).toEqual({
                type: "array",
                items: { $ref: refTo("Address") },
            });
            expectValid(schema);
        });

        test("Recursive schemas reference their definition", () => {
            const Category: z.ZodType = z
                .object({
                    name: z.string(),
                    parent: z.lazy(() => Category).optional(),
                    children: z.lazy(() => z.array(Category)),
                })
                .zod2x("Category");

            const output = toJsonSchema(z.object({ category: Category }));
            const category = getDefinitions(output).Category;

            expect(output.properties.category).toEqual({ $ref: refTo("Category") });
            expect(getReferences(category)).toContain("Category");
            expectValid(Category);
        });

        test("Definitions are in the keyword of each target", () => {
            const schema = z.object({ address: Address(), status: Status() });

            for (const target of TARGETS) {
                const output = toJsonSchema(schema, { target });

                expect(Object.keys(output)).toContain(definitionsKey(target));
                expect(definitionNames(output, target)).toEqual(["Address", "Status"]);
                expect(output.properties.address).toEqual({ $ref: refTo("Address", target) });
            }
            expectValid(schema);
        });

        test("Every definition is referenced, except members of merged intersections", () => {
            // Members of intersections stay definitions of the model, although the merged
            // intersection does not reference them.
            const cases: [z.ZodType, string[]][] = [
                [UserModel, ["UserRegionalPreferences", "UserVisualPreferences"]],
                [userApi.resUpdateUserMulti, []],
                [userDtos.updateUserUseCaseDto, []],
            ];

            for (const [schema, members] of cases) {
                for (const target of TARGETS) {
                    const output = toJsonSchema(schema, { target, unrepresentable: "any" });
                    const referenced = new Set(getReferences(output, target));
                    const unreferenced = definitionNames(output, target).filter(
                        (name) => !referenced.has(name)
                    );

                    expect([target, unreferenced]).toEqual([target, members]);
                }
            }
        });

        test("Type names that can be referenced without encoding them", () => {
            const names = [
                "UserModel",
                "user_model",
                "user-model",
                "User.Model",
                "$User",
                "A:B@C",
                "A(1)",
            ];

            for (const name of names) {
                const schema = z.object({ a: z.object({ a: z.string() }).zod2x(name) });

                for (const target of TARGETS) {
                    expect(definitionNames(toJsonSchema(schema, { target }), target)).toEqual([
                        name,
                    ]);
                }
                expectValid(schema);
            }
        });

        test("Type names that would need to be encoded in references are not allowed", () => {
            for (const name of ["A/B", "A~B", "A%B", "A B", "A#B", 'A"B', "A[0]", "Ñandú", "A?B"]) {
                const schema = z.object({ a: z.object({ a: z.string() }).zod2x(name) });

                expect(() => toJsonSchema(schema)).toThrow(
                    /cannot be the name of a JSON Schema definition/
                );
            }
        });

        test("Different schemas with the same type name are not allowed", () => {
            const schema = z.object({
                a: z.object({ a: z.string() }).zod2x("Same"),
                b: z.object({ b: z.string() }).zod2x("Same"),
            });

            expect(() => toJsonSchema(schema)).toThrow(/Same/);
        });
    });

    describe("Metadata", () => {
        test("Metadata of schemas with a type name is in their definition", () => {
            const Named = z
                .object({ a: z.string() })
                .meta({ title: "Named", description: "A named object", examples: [{ a: "a" }] })
                .zod2x("Named");

            const output = toJsonSchema(z.object({ named: Named }));

            expect(getDefinitions(output).Named).toEqual({
                type: "object",
                properties: { a: { type: "string" } },
                required: ["a"],
                additionalProperties: false,
                title: "Named",
                description: "A named object",
                examples: [{ a: "a" }],
            });
            expect(output.properties.named).toEqual({ $ref: refTo("Named") });
        });

        test("Metadata of copies is next to the reference", () => {
            const status = Status();
            const schema = z.object({
                described: status.describe("Described"),
                titled: status.meta({ title: "Titled" }),
            });

            for (const target of TARGETS) {
                const output = toJsonSchema(schema, { target });
                const { described, titled } = output.properties;

                expect(described.description).toBe("Described");
                expect(titled.title).toBe("Titled");
                expect(getReferences(described, target)).toEqual(["Status"]);
                expect(getReferences(titled, target)).toEqual(["Status"]);
                expect(getDefinitions(output, target).Status.description).toBe("A status");
            }
            expectValid(schema);
        });

        test("JSON Schemas do not have the id of the definitions", () => {
            const schema = z.object({
                address: Address(),
                status: Status(),
                custom: z.object({ a: z.string() }).meta({ id: "Custom" }),
            });

            for (const target of TARGETS) {
                for (const output of [
                    toJsonSchema(schema, { target }),
                    toJsonSchema(Address(), { target }),
                ]) {
                    forEachSchema(output, (node, pointer) => {
                        expect([pointer, "id" in node]).toEqual([pointer, false]);
                    });
                }
            }
        });

        test("Ids of the base registry take precedence over type names", () => {
            const registry = z.registry<z.core.JSONSchemaMeta>();
            const status = Status().register(registry, { id: "CustomStatus" });
            const schema = z.object({ status });
            const params = Zod2XConverters.zod2JsonSchemaDefinitions({ base: registry });

            const output = toJsonSchema(schema, {}, params);

            expect(definitionNames(output)).toEqual(["CustomStatus"]);
            expect(output.properties.status).toEqual({ $ref: refTo("CustomStatus") });
            expect(findProblems(schema, "draft-2020-12", {}, params)).toEqual([]);
        });

        test("Ids of Zod's global registry take precedence over type names", () => {
            const named = z.object({ a: z.string() }).zod2x("Name");
            z.globalRegistry.add(named, { id: "GlobalId" });
            // `zod2x` returns another schema: a copy of the one with the id, with a type name.
            const copy = z.object({ b: z.string() }).meta({ id: "OtherId" }).zod2x("Copy");
            const schema = z.object({ named, copy });

            try {
                const output = toJsonSchema(schema);

                expect(definitionNames(output)).toEqual(["Copy", "GlobalId", "OtherId"]);
                expect(output.properties.named).toEqual({ $ref: refTo("GlobalId") });
                expect(getDefinitions(output).Copy).toEqual({ $ref: refTo("OtherId") });
                expectValid(schema);
            } finally {
                z.globalRegistry.remove(named);
            }
        });

        test("Metadata of a custom base registry", () => {
            const registry = z.registry<z.core.JSONSchemaMeta>();
            const status = z.enum(["a", "b"]).zod2x("Status").register(registry, {
                description: "From a custom registry",
            });
            const described = z.enum(["c"]).describe("From the global registry").zod2x("Described");
            const params = Zod2XConverters.zod2JsonSchemaDefinitions({ base: registry });

            const output = toJsonSchema(z.object({ status, described }), {}, params);

            expect(getDefinitions(output).Status).toEqual({
                type: "string",
                enum: ["a", "b"],
                description: "From a custom registry",
            });
            // The global registry is not used when another base registry is given.
            expect(getDefinitions(output).Described).toEqual({ type: "string", enum: ["c"] });
        });

        test("Schemas and registries are not modified", () => {
            const registry = z.registry<z.core.JSONSchemaMeta>();
            const address = Address();
            const status = Status().register(registry, { description: "Custom" });
            const schema = z.object({ address, status, copy: address.clone() }).zod2x("Root");
            const before = {
                address: z.globalRegistry.get(address),
                status: registry.get(status),
                schema: z.globalRegistry.get(schema),
                json: z.toJSONSchema(schema),
            };

            toJsonSchema(schema);
            toJsonSchema(schema, {}, Zod2XConverters.zod2JsonSchemaDefinitions({ base: registry }));

            expect(z.globalRegistry.get(address)).toEqual(before.address);
            expect(registry.get(status)).toEqual(before.status);
            expect(z.globalRegistry.get(schema)).toEqual(before.schema);
            expect(z.toJSONSchema(schema)).toEqual(before.json);
            expect(
                schema.parse({ address: { street: "a" }, status: "active", copy: { street: "b" } })
            ).toEqual({
                address: { street: "a" },
                status: "active",
                copy: { street: "b" },
            });
        });
    });

    describe("Copies", () => {
        test("Copies that keep the type name reference the definition", () => {
            const address = Address();
            const schema = z.object({
                address,
                clone: address.clone(),
                described: address.describe("Described"),
                meta: address.meta({ deprecated: true }),
            });

            const output = toJsonSchema(schema);

            expect(definitionNames(output)).toEqual(["Address"]);
            expect(output.properties).toEqual({
                address: { $ref: refTo("Address") },
                clone: { $ref: refTo("Address") },
                described: { $ref: refTo("Address"), description: "Described" },
                meta: { $ref: refTo("Address"), deprecated: true },
            });
            expectValid(schema);
        });

        test("Copies of copies are only a reference", () => {
            const handle = Address().clone();
            const schema = z.object({
                copy: handle.clone(),
                copyOfCopy: handle.clone().clone(),
                described: handle.clone().describe("Described"),
            });

            const output = toJsonSchema(schema);

            expect(output.properties).toEqual({
                copy: { $ref: refTo("Address") },
                copyOfCopy: { $ref: refTo("Address") },
                described: { $ref: refTo("Address"), description: "Described" },
            });
            for (const target of TARGETS) {
                const { properties } = toJsonSchema(schema, { target });
                for (const property of Object.values<any>(properties)) {
                    expect(getReferences(property, target)).toEqual(["Address"]);
                    expect(property.type).toBeUndefined();
                }
            }
            expectValid(schema);
        });

        test("Copies keep the keywords they change", () => {
            const Name = z.string().min(1).describe("Name");
            const handle = Name.clone();
            const schema = z.object({
                min: handle.min(3),
                max: handle.clone().max(5),
                both: Name.clone().clone().min(2).max(4),
                refined: Address()
                    .clone()
                    .refine(() => true),
            });

            const output = toJsonSchema(schema);

            expect(output.properties.min).toEqual({
                type: "string",
                minLength: 3,
                description: "Name",
            });
            expect(output.properties.max).toEqual({
                type: "string",
                minLength: 1,
                maxLength: 5,
                description: "Name",
            });
            expect(output.properties.both).toEqual({
                type: "string",
                minLength: 2,
                maxLength: 4,
                description: "Name",
            });
            expect(output.properties.refined).toEqual({ $ref: refTo("Address") });
            expectValid(schema);
        });

        test("Copies with checks next to the reference keep their type", () => {
            const alias = tsSupportedSchemasModel.stringItem as z.ZodString;
            const schema = z.object({
                min: alias.min(3),
                described: alias.clone().describe("Other"),
            });

            const output = toJsonSchema(schema);

            expect(output.properties.min).toEqual({
                type: "string",
                minLength: 3,
                $ref: refTo("StringItem"),
            });
            expect(output.properties.described).toEqual({
                $ref: refTo("StringItem"),
                description: "Other",
            });
            expectValid(schema);
        });

        test("Copies with another unknown keys policy are inlined", () => {
            const address = Address();
            const schema = z.object({ address, strict: address.strict(), loose: address.loose() });

            const output = toJsonSchema(schema);

            // Zod does not keep the metadata of the original schema in these copies.
            const { description: _description, ...definition } = getDefinitions(output).Address;
            expect(output.properties.address).toEqual({ $ref: refTo("Address") });
            expect(output.properties.strict).toEqual(definition);
            expect(output.properties.loose.$ref).toBeUndefined();
            expect(output.properties.loose.additionalProperties).not.toBe(false);
            expectValid(schema);
        });

        test("Copies with another type name are definitions that reference the original", () => {
            const address = Address();
            const schema = z.object({
                home: address.clone().zod2x("HomeAddress"),
                work: address.describe("Work").zod2x("WorkAddress"),
            });

            const output = toJsonSchema(schema);
            const definitions = getDefinitions(output);

            expect(definitionNames(output)).toEqual(["Address", "HomeAddress", "WorkAddress"]);
            expect(definitions.HomeAddress).toEqual({ $ref: refTo("Address") });
            expect(definitions.WorkAddress).toEqual({
                $ref: refTo("Address"),
                description: "Work",
            });
            expect(output.properties).toEqual({
                home: { $ref: refTo("HomeAddress") },
                work: { $ref: refTo("WorkAddress") },
            });
            expectValid(schema);
        });

        test("Copies of intersections reference the definition", () => {
            const A = z.object({ a: z.string() }).zod2x("A");
            const B = z.object({ b: z.string() }).zod2x("B");
            const handle = z.intersection(A, B).describe("AB").zod2x("AB").clone();
            const schema = z.object({
                copy: handle,
                copyOfCopy: handle.clone(),
                described: handle.clone().describe("Other"),
            });

            for (const target of TARGETS) {
                const output = toJsonSchema(schema, { target });

                expect(getDefinitions(output, target).AB).toEqual({
                    type: "object",
                    properties: { a: { type: "string" }, b: { type: "string" } },
                    required: ["a", "b"],
                    additionalProperties: false,
                    description: "AB",
                });
                expect(isOnlyReference(output.properties.copy, "AB", target)).toBe(true);
                expect(isOnlyReference(output.properties.copyOfCopy, "AB", target)).toBe(true);
                expect(getReferences(output.properties.described, target)).toEqual(["AB"]);
                expect(output.properties.described.description).toBe("Other");
            }
            expectValid(schema);
        });
    });

    describe("Intersections", () => {
        /**
         * Checks that the JSON Schemas validate the same data as Zod. Output JSON Schemas reject
         * unknown properties, which Zod strips, so these values are only compared in input ones.
         */
        const expectSameDataAsZod = (schema: z.ZodType, valid: unknown) => {
            expect(schema.safeParse(valid).success).toBe(true);
            for (const target of ["draft-2020-12", "draft-07"] as const) {
                for (const io of ["output", "input"] as const) {
                    const validate = compile(toJsonSchema(schema, { target, io }), target)!;
                    const values = [valid, ...getMutations(valid)].filter(
                        (value) => io === "input" || !JSON.stringify(value).includes("unknownKey")
                    );

                    for (const value of values) {
                        expect([target, io, value, validate(value)]).toEqual([
                            target,
                            io,
                            value,
                            schema.safeParse(value).success,
                        ]);
                    }
                }
            }
        };

        // Each test uses its own schemas: different schemas cannot have the same type name.
        let visual: z.ZodObject<any>;
        let regional: z.ZodObject<any>;
        const Visual = () => visual;
        const Regional = () => regional;
        beforeEach(() => {
            visual = z.object({ theme: z.string() }).describe("Visual").zod2x("VisualPreferences");
            regional = z.object({ language: z.string() }).zod2x("RegionalPreferences");
        });

        test("Members with type names are merged into one object", () => {
            const Preferences = z
                .intersection(Visual(), Regional())
                .describe("Preferences")
                .zod2x("Preferences");

            for (const target of TARGETS) {
                const output = toJsonSchema(z.object({ preferences: Preferences }), { target });

                expect(output.properties.preferences).toEqual({
                    $ref: refTo("Preferences", target),
                });
                expect(getDefinitions(output, target).Preferences).toEqual({
                    type: "object",
                    properties: { theme: { type: "string" }, language: { type: "string" } },
                    required: ["theme", "language"],
                    additionalProperties: false,
                    description: "Preferences",
                });
            }
            expectValid(Preferences);
            expectSameDataAsZod(Preferences, { theme: "dark", language: "es" });
        });

        test("Members keep their definitions", () => {
            const visual = Visual();
            const schema = z.object({
                visual,
                preferences: z.intersection(visual, Regional()).zod2x("Preferences"),
            });

            const output = toJsonSchema(schema);
            const definitions = getDefinitions(output);

            expect(definitionNames(output)).toEqual([
                "Preferences",
                "RegionalPreferences",
                "VisualPreferences",
            ]);
            expect(output.properties.visual).toEqual({ $ref: refTo("VisualPreferences") });
            expect(definitions.VisualPreferences).toEqual({
                type: "object",
                properties: { theme: { type: "string" } },
                required: ["theme"],
                additionalProperties: false,
                description: "Visual",
            });
            // Annotations of the members describe the members, not the intersection.
            expect(definitions.Preferences.description).toBeUndefined();
            expectValid(schema);
        });

        test("Intersections without a type name are merged where they are used", () => {
            const schema = z.object({
                preferences: z.intersection(Visual(), Regional()),
                list: z.array(z.intersection(Visual(), Regional())),
            });

            const output = toJsonSchema(schema);
            const merged = {
                type: "object",
                properties: { theme: { type: "string" }, language: { type: "string" } },
                required: ["theme", "language"],
                additionalProperties: false,
            };

            expect(output.properties.preferences).toEqual(merged);
            expect(output.properties.list).toEqual({ type: "array", items: merged });
            expectValid(schema);
            expectSameDataAsZod(schema, {
                preferences: { theme: "a", language: "b" },
                list: [{ theme: "c", language: "d" }],
            });
        });

        test("Members without a type name", () => {
            const schema = z
                .intersection(Visual(), z.object({ fontSize: z.number().optional() }))
                .zod2x("Preferences");

            const output = toJsonSchema(z.object({ preferences: schema }));

            expect(getDefinitions(output).Preferences).toEqual({
                type: "object",
                properties: { theme: { type: "string" }, fontSize: { type: "number" } },
                required: ["theme"],
                additionalProperties: false,
            });
            expectValid(schema);
            expectSameDataAsZod(schema, { theme: "a", fontSize: 12 });
        });

        test("Several members and nested intersections", () => {
            const Timezone = z.object({ timezone: z.string() }).zod2x("Timezone");
            const Named = z.intersection(Visual(), Regional()).zod2x("VisualAndRegional");
            const schema = z.object({
                nestedNamed: z.intersection(Named, Timezone).zod2x("All"),
                chain: z.intersection(z.intersection(Visual(), Regional()), Timezone),
            });

            const output = toJsonSchema(schema);
            const all = {
                type: "object",
                properties: {
                    theme: { type: "string" },
                    language: { type: "string" },
                    timezone: { type: "string" },
                },
                required: ["theme", "language", "timezone"],
                additionalProperties: false,
            };

            expect(getDefinitions(output).All).toEqual(all);
            expect(output.properties.chain).toEqual(all);
            expectValid(schema);
            expectSameDataAsZod(schema, {
                nestedNamed: { theme: "a", language: "b", timezone: "c" },
                chain: { theme: "d", language: "e", timezone: "f" },
            });
        });

        test("Properties declared by several members", () => {
            const status = Status();
            const Inner = z.object({ x: z.string() }).zod2x("Inner");
            const OtherInner = z.object({ y: z.number() }).zod2x("OtherInner");
            const A = z.object({ status, name: z.string().min(1), inner: Inner }).zod2x("A");
            const B = z.object({ status, name: z.string().max(5), inner: OtherInner }).zod2x("B");
            const schema = z.intersection(A, B).zod2x("AB");

            const output = toJsonSchema(z.object({ ab: schema }));
            const { properties } = getDefinitions(output).AB;

            expect(properties.status).toEqual({ $ref: refTo("Status") });
            expect(properties.name).toEqual({
                allOf: [
                    { type: "string", minLength: 1 },
                    { type: "string", maxLength: 5 },
                ],
            });
            expect(properties.inner).toEqual({
                type: "object",
                properties: { x: { type: "string" }, y: { type: "number" } },
                required: ["x", "y"],
                additionalProperties: false,
            });
            expectValid(schema);
            expectSameDataAsZod(schema, {
                status: "active",
                name: "abc",
                inner: { x: "x", y: 1 },
            });
        });

        test("Unknown properties are rejected only if every member rejects them", () => {
            const closed = Visual();
            const loose = z.object({ language: z.string() }).loose().zod2x("Loose");
            const catchall = z
                .object({ language: z.string() })
                .catchall(z.string())
                .zod2x("Catchall");
            const schema = z.object({
                closed: z.intersection(closed, Regional()),
                loose: z.intersection(closed, loose),
                catchall: z.intersection(closed, catchall),
            });

            const output = toJsonSchema(schema);

            expect(output.properties.closed.additionalProperties).toBe(false);
            expect(output.properties.loose.additionalProperties).not.toBe(false);
            expect(output.properties.catchall.additionalProperties).toEqual({ type: "string" });
            expectValid(schema);
            expectSameDataAsZod(schema, {
                closed: { theme: "a", language: "b" },
                loose: { theme: "a", language: "b", other: true },
                catchall: { theme: "a", language: "b", size: "large" },
            });
        });

        test("Wrappers of intersections", () => {
            const Preferences = z.intersection(Visual(), Regional()).zod2x("Preferences");
            const unnamed = z.intersection(Visual(), Regional());
            const schema = z.object({
                optional: Preferences.optional(),
                nullable: unnamed.nullable(),
                array: z.array(unnamed),
                record: z.record(z.string(), Preferences),
                described: unnamed.describe("Described"),
            });

            const output = toJsonSchema(schema);

            expect(output.properties.optional).toEqual({ $ref: refTo("Preferences") });
            expect(getReferences(output.properties.record)).toEqual(["Preferences"]);
            expectValid(schema);
            expectSameDataAsZod(schema, {
                optional: { theme: "a", language: "b" },
                nullable: null,
                array: [{ theme: "c", language: "d" }],
                record: { key: { theme: "e", language: "f" } },
                described: { theme: "g", language: "h" },
            });
        });

        test("Records are merged as objects with a constraint on all the properties", () => {
            const schema = z
                .intersection(Visual(), z.record(z.string(), z.string()))
                .zod2x("Strings");

            const output = toJsonSchema(z.object({ strings: schema }));

            expect(getDefinitions(output).Strings).toEqual({
                type: "object",
                properties: { theme: { type: "string" } },
                required: ["theme"],
                propertyNames: { type: "string" },
                additionalProperties: { type: "string" },
            });
            expectValid(schema);
            expectSameDataAsZod(schema, { theme: "a", other: "b" });
        });

        test("Intersections with members that are not objects are not changed", () => {
            const schema = z.object({
                union: z.intersection(
                    Visual(),
                    z.union([Regional(), z.object({ code: z.string() })])
                ),
            });

            for (const target of TARGETS) {
                // Zod 4.3 emits the `id` of the definitions without the zod-to-x override.
                expect(toJsonSchema(schema, { target })).toEqual(
                    withoutIds(toZodJsonSchema(schema, { target }))
                );
            }
            expectValid(schema);
        });

        test("Intersections of layered models", () => {
            const { intersectionItem } = tsSupportedSchemasModel;

            const output = toJsonSchema(intersectionItem);
            const definition = getRootDefinition(output);

            expect(definition.type).toBe("object");
            expect(definition.allOf).toBeUndefined();
            expect(Object.keys(definition.properties)).toEqual(["key", "otherKey"]);
            expectValid(intersectionItem);
            expectSameDataAsZod(intersectionItem, { key: "a", otherKey: "b" });
        });

        test("Parameters reused for conversions with other targets and modes", () => {
            const params = Zod2XConverters.zod2JsonSchemaDefinitions();
            const schema = z.object({
                named: z.intersection(Visual(), Regional()).zod2x("Preferences"),
                unnamed: z.intersection(Visual(), Regional()),
            });
            const variants = [
                { target: "draft-07" },
                {},
                { target: "draft-07" },
                { io: "input" },
                { target: "openapi-3.0" },
                {},
            ] as const;

            for (const variant of variants) {
                expect(toJsonSchema(schema, variant, params)).toEqual(
                    toJsonSchema(schema, variant)
                );
            }
        });

        test("Custom overrides can look up the metadata", () => {
            const schema = z.object({
                named: z.intersection(Visual(), Regional()).zod2x("Preferences"),
                unnamed: z.intersection(Visual(), Regional()),
            });
            const params = Zod2XConverters.zod2JsonSchemaDefinitions({
                override: ({ zodSchema }) => {
                    params.metadata.get(zodSchema);
                },
            });

            expect(toJsonSchema(schema, {}, params)).toEqual(toJsonSchema(schema));
            expect(findProblems(schema, "draft-2020-12", {}, params)).toEqual([]);
        });
    });

    describe("Generic types", () => {
        const Response = () =>
            z.object({ data: createGenericType("T"), page: z.number() }).zod2x("Response");

        test("Instances without a type name of their own are inlined", () => {
            const response = Response();
            const schema = z.object({
                strings: useGenericType(response, { data: z.string() }, true),
                addresses: useGenericType(response, { data: z.array(Address()) }, true),
            });

            const output = toJsonSchema(schema);

            expect(definitionNames(output)).toEqual(["Address"]);
            expect(output.properties.strings).toEqual({
                type: "object",
                properties: { data: { type: "string" }, page: { type: "number" } },
                required: ["data", "page"],
                additionalProperties: false,
            });
            expect(output.properties.addresses.properties.data).toEqual({
                type: "array",
                items: { $ref: refTo("Address") },
            });
            expectValid(schema);
        });

        test("Instances with a type name of their own are definitions", () => {
            const response = Response();
            const schema = z.object({
                strings: useGenericType(response, { data: z.string() }, true).zod2x(
                    "StringResponse"
                ),
                lazy: useGenericType(response, { data: z.number() }),
            });

            const output = toJsonSchema(schema);

            expect(definitionNames(output)).toEqual(["StringResponse"]);
            expect(output.properties.strings).toEqual({ $ref: refTo("StringResponse") });
            expect(output.properties.lazy.$ref).toBeUndefined();
            expectValid(schema);
        });

        test("Default types of templates", () => {
            const Page = z
                .object({ items: createGenericType("T", z.array(Address())), total: z.number() })
                .zod2x("Page");
            const schema = z.object({ page: useGenericType(Page, {}, true) });

            const output = toJsonSchema(schema);

            expect(definitionNames(output)).toEqual(["Address"]);
            expect(output.properties.page.properties.items).toEqual({
                type: "array",
                items: { $ref: refTo("Address") },
            });
            expectValid(schema);
        });

        test("The generic type is a definition", () => {
            const response = Response();
            const output = toJsonSchema(z.object({ response }));

            expect(definitionNames(output)).toEqual(["Response"]);
            expect(getDefinitions(output).Response.properties.data).toEqual({});
            expectValid(response);
        });
    });

    describe("Layered modeling", () => {
        test("Types of a model are definitions", () => {
            const output = toJsonSchema(userModels.userEntity);
            const entity = getRootDefinition(output);

            expect(typeNames(output, "UserEntity")).toEqual(["UserEntity", "UserRole"]);
            expect(entity.properties.role).toEqual({ $ref: refTo("UserRole") });
            expect(getDefinitions(output).UserRole).toEqual({
                type: "string",
                enum: ["Admin", "User"],
            });
            expectValid(userModels.userEntity);
        });

        test("Types derived from types of other models are definitions", () => {
            const output = toJsonSchema(userDtos.createUserUseCaseDto);
            const dto = getRootDefinition(output);

            expect(typeNames(output, "CreateUserUseCaseDto")).toEqual([
                "CreateUserUseCaseDto",
                "UserRole",
            ]);
            expect(Object.keys(dto.properties)).toEqual(["name", "email", "age", "role"]);
            expectValid(userDtos.createUserUseCaseDto);
        });

        test("Aliases of types of other models are only a reference", () => {
            for (const target of TARGETS) {
                const output = toJsonSchema(
                    z.object({ dto: userDtos.updateUserUseCaseResultDto }),
                    {
                        target,
                    }
                );

                expect(namedDefinitions(output, target)).toEqual([
                    "UpdateUserUseCaseResultDto",
                    "UserEntity",
                    "UserRole",
                ]);
                expect(getDefinitions(output, target).UpdateUserUseCaseResultDto).toEqual({
                    $ref: refTo("UserEntity", target),
                });
            }
            expectValid(userDtos.updateUserUseCaseResultDto);
        });

        test("Aliases of aliases are only references", () => {
            for (const target of TARGETS) {
                const output = toJsonSchema(
                    z.object({ request: userApi.reqUpdateUser, response: userApi.resUpdateUser }),
                    { target }
                );
                const definitions = getDefinitions(output, target);

                expect(definitions.ReqUpdateUser).toEqual({
                    $ref: refTo("UpdateUserUseCaseDto", target),
                });
                expect(definitions.UpdateUserUseCaseDto).toEqual({
                    $ref: refTo("CreateUserUseCaseDto", target),
                });
                expect(definitions.ResUpdateUser).toEqual({
                    $ref: refTo("UpdateUserUseCaseResultDto", target),
                });
                expect(definitions.UpdateUserUseCaseResultDto).toEqual({
                    $ref: refTo("UserEntity", target),
                });
                expect(definitions.UserEntity.type).toBe("object");
            }
            expectValid(userApi.reqUpdateUser);
            expectValid(userApi.resUpdateUser);
        });

        test("Arrays of aliases reference the alias", () => {
            const output = toJsonSchema(userApi.resUpdateUserMulti);
            const multi = getRootDefinition(output);

            expect(multi.properties.data).toEqual({
                type: "array",
                items: { $ref: refTo("UpdateUserUseCaseResultDto") },
            });
            expect(getDefinitions(output).UpdateUserUseCaseResultDto).toEqual({
                $ref: refTo("UserEntity"),
            });
            expectValid(userApi.resUpdateUserMulti);
        });

        test("Unrepresentable types of models", () => {
            const output = toJsonSchema(userDtos.createUserUseCaseResultDto, {
                unrepresentable: "any",
            });

            expect(typeNames(output, "CreateUserUseCaseResultDto")).toEqual([
                "CreateUserUseCaseResultDto",
            ]);
            expect(() => toJsonSchema(userDtos.createUserUseCaseResultDto)).toThrow();
            expectValid(userDtos.createUserUseCaseResultDto, { unrepresentable: "any" });
        });
    });

    describe("Parameters", () => {
        test("Parameters can be used for several conversions and targets", () => {
            const params = Zod2XConverters.zod2JsonSchemaDefinitions();
            const schema = z.object({ address: Address().clone().clone(), status: Status() });

            const first = toJsonSchema(schema, {}, params);
            const draft7 = toJsonSchema(schema, { target: "draft-07" }, params);
            const input = toJsonSchema(schema, { io: "input" }, params);
            const again = toJsonSchema(schema, {}, params);

            expect(again).toEqual(first);
            expect(draft7).toEqual(toJsonSchema(schema, { target: "draft-07" }));
            expect(input).toEqual(toJsonSchema(schema, { io: "input" }));
            expect(first.properties.address).toEqual({ $ref: refTo("Address") });
        });

        test("Custom override is called for every schema after the one of zod-to-x", () => {
            const handle = Address().clone();
            const seen: z.core.$ZodType[] = [];
            const params = Zod2XConverters.zod2JsonSchemaDefinitions({
                override: ({ zodSchema, jsonSchema }) => {
                    seen.push(zodSchema);
                    if (jsonSchema.$ref !== undefined) {
                        jsonSchema.title = Object.keys(jsonSchema).join();
                    }
                },
            });

            const output = toJsonSchema(z.object({ address: handle.clone() }), {}, params);

            expect(output.properties.address).toEqual({ $ref: refTo("Address"), title: "$ref" });
            expect(seen.length).toBeGreaterThanOrEqual(3);
        });

        test("Input JSON Schemas", () => {
            const schema = z.object({
                address: Address().clone().clone(),
                status: Status().default("active"),
            });

            const output = toJsonSchema(schema, { io: "input" });

            expect(definitionNames(output)).toEqual(["Address", "Status"]);
            expect(output.properties.address).toEqual({ $ref: refTo("Address") });
            expect(output.required).toEqual(["address"]);
            expectValid(schema, { io: "input" });
        });
    });

    describe("Example of the README", () => {
        test("User model", () => {
            const example = JSON.parse(
                fs.readFileSync("./test/test_zod2jschema_def/user_schema.json", "utf-8")
            );
            const output = toJsonSchema(UserModel, { target: "draft-07", unrepresentable: "any" });

            expect(typeNames(output, "UserModel", "draft-07")).toEqual(
                Object.keys(example.definitions).sort()
            );
            // Zod < 4.5 does not extract the root, which references itself with "#".
            const references = (definition: JsonSchema) =>
                getReferences(definition, "draft-07").filter((name) => name !== "UserModel");
            for (const [name, definition] of Object.entries<any>(example.definitions)) {
                const generated =
                    name === "UserModel"
                        ? getRootDefinition(output, "draft-07")
                        : getDefinitions(output, "draft-07")[name];
                expect([name, references(generated)]).toEqual([name, references(definition)]);
            }
            expectValid(UserModel, { unrepresentable: "any" });
        });
    });
});
