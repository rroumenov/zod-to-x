import { core, z } from "zod/v4";

import { getCopySource, resolveZod2xMetadata } from "@/lib/zod2x_metadata";

import { getDefinitionName, IntersectionMerger } from "./json_schema_intersections";

type JsonSchemaRegistry = core.$ZodRegistry<core.JSONSchemaMeta>;
/**
 * The `override` parameter of `z.toJSONSchema` (its parameters type is not exported by every Zod 4
 * version).
 */
export type JsonSchemaOverride = (ctx: {
    zodSchema: core.$ZodTypes;
    jsonSchema: core.JSONSchema.BaseSchema;
    path: (string | number)[];
}) => void;

export interface IZod2JsonSchemaDefinitionsOpt {
    /**
     * Registry of the rest of the metadata (descriptions, titles, examples, ...).
     * Defaults to Zod's global registry, used by `.describe()` and `.meta()`.
     */
    base?: JsonSchemaRegistry;

    /**
     * Custom `override` of `z.toJSONSchema`, called after the one of zod-to-x.
     */
    override?: JsonSchemaOverride;
}

export interface IZod2JsonSchemaDefinitions {
    metadata: JsonSchemaRegistry;
    override: JsonSchemaOverride;
}

/**
 * Characters of the names of definitions that can be used in references without encoding them,
 * whatever the Zod version: characters of URI fragments (RFC 3986) that are not escaped in JSON
 * pointers (`~`, `/`, which Zod escapes since 4.5) and are not percent-encodings (`%`).
 */
const DEFINITION_NAME = /^[A-Za-z0-9\-._!$&'()*+,;=:@]+$/;

/**
 * Metadata registry for `z.toJSONSchema` that gives the zod2x type name of each schema as its
 * `id`, so Zod extracts the schemas with a type name into the definitions (`$defs`, or
 * `definitions` before draft 2020-12) and references them with `$ref`.
 *
 * The rest of the metadata comes from a base registry, with the inheritance rules of Zod
 * registries (copies inherit the metadata of their parent, except its `id`). Following the same
 * rule, the `id` is only given to the schemas whose type name is their own: copies of a schema
 * that keep its type name (`.describe()`, `.meta()`, `.strict()`, handles of layered models...)
 * reference it or are inlined, and instances of a generic type without a type name of their own
 * are inlined. An `id` set in the base registry takes precedence over the type name.
 */
class Zod2xJsonSchemaRegistry extends core.$ZodRegistry<core.JSONSchemaMeta> {
    constructor(private readonly base: JsonSchemaRegistry) {
        super();
    }

    /**
     * Called when Zod looks up the metadata of a schema: Zod only does it before calling the
     * `override` (and to read the `id` of the root after it), so it starts a conversion.
     */
    onLookup?: () => void;

    override get(schema: core.$ZodType): core.JSONSchemaMeta | undefined {
        this.onLookup?.();
        return this.resolve(schema);
    }

    /** Metadata of a schema, without starting a conversion. */
    resolve(schema: core.$ZodType): core.JSONSchemaMeta | undefined {
        const meta = this.base.get(schema);
        const id = meta?.id ?? this.getOwnTypeName(schema);
        return id === undefined ? meta : { ...meta, id };
    }

    private getOwnTypeName(schema: core.$ZodType): string | undefined {
        const metadata = resolveZod2xMetadata(schema);
        const typeName = metadata?.typeName;

        if (typeName === undefined) {
            return undefined;
        }

        // Instance of a generic type that takes the type name of the generic type.
        if (metadata!.isGenericChild === false && typeName === metadata!.genericOf) {
            return undefined;
        }

        // Copy of a schema with the same type name, which is the one defining it.
        const source = getCopySource(schema);
        if (source !== undefined && resolveZod2xMetadata(source)?.typeName === typeName) {
            return undefined;
        }

        if (!DEFINITION_NAME.test(typeName)) {
            throw new Error(
                `The type name "${typeName}" cannot be the name of a JSON Schema definition: ` +
                    `Zod does not encode it in the references. Only letters, digits and the ` +
                    `characters - . _ ! $ & ' ( ) * + , ; = : @ are allowed.`
            );
        }

        return typeName;
    }
}

/**
 * Keywords that do not change the validated data.
 */
const ANNOTATIONS = new Set([
    "title",
    "description",
    "examples",
    "default",
    "deprecated",
    "readOnly",
    "writeOnly",
    "$comment",
]);

/**
 * Keywords that depend on other keywords of the same schema (e.g. `additionalProperties` applies to
 * the properties not declared by `properties`): a keyword is only implied by a definition if all
 * the keywords of its group are the same.
 */
const KEYWORD_GROUPS = [
    ["properties", "patternProperties", "additionalProperties", "unevaluatedProperties"],
    ["items", "prefixItems", "additionalItems", "unevaluatedItems"],
    ["if", "then", "else"],
];

function isImplied(
    json: Record<string, unknown>,
    definition: Record<string, unknown>,
    key: string
): boolean {
    const group = KEYWORD_GROUPS.find((keys) => keys.includes(key)) ?? [key];
    return group.every(
        (member) => JSON.stringify(json[member]) === JSON.stringify(definition[member])
    );
}

/**
 * Creates the `override` that removes from the JSON Schema of a copy (`_zod.parent`) the keywords
 * that are the same in the definition of the closest extracted schema it comes from, so that a
 * copy that does not change its type is only a reference to it.
 *
 * Zod only does it with the definition of the direct parent, so copies of copies that are not
 * extracted (e.g. layered model properties set to the property of another model) repeat the whole
 * definition next to the reference. Definitions that are only a reference are left as a plain
 * `$ref` (draft-07 wraps references in `allOf`).
 *
 * Zod calls the override once for each schema, after calling it for the schemas it comes from,
 * so the JSON Schema stored for a schema always belongs to the current conversion.
 */
function createOverride(
    metadata: Zod2xJsonSchemaRegistry,
    custom?: JsonSchemaOverride
): JsonSchemaOverride {
    const jsonSchemas = new WeakMap<object, Record<string, unknown>>();
    const intersections = new IntersectionMerger(ANNOTATIONS);
    let inConversion = false;
    let inCustomOverride = false;

    // The intersections wait for the definitions of the conversion: the ones of a previous
    // conversion (e.g. with another target) are forgotten. Lookups of the custom override do not
    // start a conversion.
    metadata.onLookup = () => {
        if (inConversion && !inCustomOverride) {
            inConversion = false;
            intersections.reset();
        }
    };

    const override: JsonSchemaOverride = ({ zodSchema, jsonSchema }) => {
        inConversion = true;
        const json = jsonSchema as Record<string, any>;
        jsonSchemas.set(zodSchema, json);

        // The `id` of the registry identifies the definitions, but it is not part of the JSON
        // Schema (in draft-04, `id` sets the base URI of references). Zod emits it before 4.4.
        const id = metadata.resolve(zodSchema)?.id;
        if (id !== undefined && json.id === id) {
            delete json.id;
        }

        // Definitions the schema comes from, the closest first. A copy can only add constraints
        // to the schema it comes from, so each definition implies the ones after it.
        const sources: core.$ZodType[] = [];
        for (
            let source = zodSchema._zod.parent;
            source !== undefined;
            source = source._zod.parent
        ) {
            if (metadata.resolve(source)?.id !== undefined) {
                sources.push(source);
            }
        }

        if (id !== undefined) {
            intersections.addDefinition(id, json);
        }
        if (zodSchema._zod.def.type === "intersection") {
            const sourceIds = sources.map((source) => metadata.resolve(source)?.id as string);
            intersections.addIntersection(json, id !== undefined, sourceIds);
        }
        intersections.mergeReady();

        // Only the JSON Schemas that reference the closest definition are reduced (older drafts
        // reference it with a member of `allOf`): Zod can also repeat it without referencing it.
        const closestId = sources.length > 0 ? metadata.resolve(sources[0])?.id : undefined;
        const isClosestReference = (member: any) =>
            closestId !== undefined && getDefinitionName(member?.$ref) === closestId;
        const isReference =
            isClosestReference(json) ||
            (Array.isArray(json.allOf) && json.allOf.some(isClosestReference));
        const definitions = sources
            .map((source) => jsonSchemas.get(source))
            .filter((definition) => definition !== undefined);

        if (isReference && definitions.length > 0) {
            const implied = Object.keys(json).filter(
                (key) =>
                    key !== "$ref" &&
                    key !== "allOf" &&
                    definitions.some(
                        (definition) => key in definition && isImplied(json, definition, key)
                    )
            );
            // Validators and tools expect the `type` of the keywords that depend on it (e.g.
            // `minLength`): it is only removed if no other assertion is left next to the reference.
            const isLeft = (key: string) =>
                key !== "$ref" &&
                key !== "allOf" &&
                !ANNOTATIONS.has(key) &&
                !implied.includes(key);
            const removed = Object.keys(json).some(isLeft)
                ? implied.filter((key) => key !== "type")
                : implied;
            removed.forEach((key) => delete json[key]);

            // `allOf` is a conjunction: its members that are in the `allOf` of a referenced
            // definition (e.g. members of intersections), or whose keywords are the ones of a
            // referenced definition (e.g. merged intersections), are already applied by the
            // reference, which is not one of them.
            if (Array.isArray(json.allOf)) {
                const inherited = new Set(
                    definitions.flatMap((definition) =>
                        Array.isArray(definition.allOf)
                            ? definition.allOf.map((member) => JSON.stringify(member))
                            : []
                    )
                );
                const isInherited = (member: any) =>
                    inherited.has(JSON.stringify(member)) ||
                    (typeof member === "object" &&
                        member !== null &&
                        !("$ref" in member) &&
                        definitions.some((definition) =>
                            Object.keys(member).every(
                                (key) => key in definition && isImplied(member, definition, key)
                            )
                        ));
                const allOf = json.allOf.filter((member) => !isInherited(member));

                if (allOf.length > 0) {
                    json.allOf = allOf;
                } else {
                    delete json.allOf;
                }
            }
        }

        // References of definitions without other keywords are left as a plain `$ref`. Only the
        // JSON Schema of definitions is changed: the one of other schemas is read by Zod after the
        // override to build the schemas that come from them, and a `$ref` there would be copied
        // next to their other keywords (which are ignored next to `$ref` before draft 2019-09).
        const allOf = json.allOf;
        if (
            id !== undefined &&
            Object.keys(json).length === 1 &&
            Array.isArray(allOf) &&
            allOf.length === 1 &&
            Object.keys(allOf[0] ?? {}).join() === "$ref"
        ) {
            delete json.allOf;
            json.$ref = allOf[0].$ref;
        }
    };

    if (custom === undefined) {
        return override;
    }

    return (ctx) => {
        override(ctx);
        inCustomOverride = true;
        try {
            custom(ctx);
        } finally {
            inCustomOverride = false;
        }
    };
}

/**
 * Minimum Zod version whose JSON Schemas with definitions are valid with the `override`.
 */
export const MIN_ZOD_VERSION_FOR_JSON_SCHEMA_DEFINITIONS = "4.3.6";

function checkZodVersion() {
    const installed = [core.version.major, core.version.minor, core.version.patch];
    const minimum = MIN_ZOD_VERSION_FOR_JSON_SCHEMA_DEFINITIONS.split(".").map(Number);
    const difference = installed.map((part, i) => part - minimum[i]).find((part) => part !== 0);

    if (difference !== undefined && difference < 0) {
        throw new Error(
            `zod2JsonSchemaDefinitions requires Zod ${MIN_ZOD_VERSION_FOR_JSON_SCHEMA_DEFINITIONS} ` +
                `or later (installed: ${installed.join(".")}): earlier versions generate invalid ` +
                `JSON Schemas with definitions.`
        );
    }
}

/**
 * Creates the parameters of Zod's native `z.toJSONSchema` so that the schemas with a zod2x type
 * name (set with `zod2x` or by layered modeling) become definitions referenced with `$ref`.
 *
 * @example
 * const jsonSchema = z.toJSONSchema(UserModel, {
 *     ...Zod2XConverters.zod2JsonSchemaDefinitions(),
 * });
 * // { $ref: "#/$defs/UserModel", $defs: { UserModel: {...}, UserAddress: {...}, ... } }
 *
 * @remarks Requires Zod 4.3.6 or later. Earlier versions do not let the `override` reach every
 * schema and emit the `id` of the definitions, which makes the JSON Schemas invalid (e.g. it sets
 * the base URI of the references in draft-04).
 *
 * @param opt - Base metadata registry and custom override.
 * @returns The `metadata` and `override` parameters of `z.toJSONSchema`. They do not modify the
 *          schemas or the base registry, and can be used for any number of conversions.
 * @throws If the installed Zod version is earlier than 4.3.6.
 */
export function zod2JsonSchemaDefinitions(
    opt: IZod2JsonSchemaDefinitionsOpt = {}
): IZod2JsonSchemaDefinitions {
    checkZodVersion();

    const metadata = new Zod2xJsonSchemaRegistry(opt.base ?? z.globalRegistry);
    return { metadata, override: createOverride(metadata, opt.override) };
}
