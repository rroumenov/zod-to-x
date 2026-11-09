import type { ZodEnum, ZodNativeEnum, ZodTypeAny } from "zod";

import type { IZod2xLayerMetadata, IZod2xMetadata } from "./zod_ext";

/**
 * Zod2X metadata is stored out of the schemas, keyed by schema instance, instead of being
 * injected as a property into them. Zod's prototypes are not modified.
 *
 * Zod 3 creates a new schema, copying its definition, for any change of a schema. Copies that only
 * change its documentation or its unknown keys handling (`.describe()`, `.strict()`,
 * `.passthrough()`, ...) represent the same type, so they inherit its metadata unless they have
 * their own. Copies that change the type (`.extend()`, `.omit()`, `.pick()`, ...) are new types
 * and do not inherit it. Metadata is not merged with the source one: the closest metadata is used
 * as a whole, so layer aliases do not inherit fields from the original type.
 *
 * Copies are found in two ways (see `getCopySource`):
 * - Schemas created by zod-to-x (`zod2x` copies, handles of layered model properties, generic
 *   instances) reference themselves in their definition, under a symbol key that Zod copies with
 *   the rest of the definition (`linkCopies`).
 * - Copies of schemas created by the user are found by their structure: the same definition
 *   members, except cosmetic ones (`registerCopySource`). Schemas whose copies cannot be told apart
 *   from new schemas by their structure (arrays, optionals, literals, ...) are linked as the
 *   schemas created by zod-to-x.
 */
const store = new WeakMap<object, IZod2xMetadata>();

/**
 * Key of the schema definition that references the schema the definition was copied from. Zod
 * copies it with the rest of the definition when a new schema is created from an existing one.
 */
const SOURCE = Symbol.for("zod-to-x.source");

/**
 * Definition keys that do not change the transpiled type.
 */
const COSMETIC_DEF_KEYS = new Set<PropertyKey>([
    SOURCE,
    "description",
    "errorMap",
    "unknownKeys",
    "catchall",
]);

/**
 * Kinds of schemas whose copies are found by structure. Their definition has members that only
 * their copies share: object shapes, enum values, union options and intersected types (types that
 * must have a name), and the checks of basic types. Other kinds (arrays, optionals, records, ...)
 * are equal to any other schema of their kind with the same members (e.g. `z.array(Item)`).
 */
const STRUCTURAL_KINDS = new Set<string>([
    "ZodObject",
    "ZodEnum",
    "ZodNativeEnum",
    "ZodUnion",
    "ZodDiscriminatedUnion",
    "ZodIntersection",
    "ZodString",
    "ZodNumber",
    "ZodBigInt",
    "ZodDate",
]);

function isCosmeticCopy(def: any, sourceDef: any): boolean {
    if (typeof def !== "object" || def === null || typeof sourceDef !== "object") {
        return false;
    }

    const keys = new Set([...Reflect.ownKeys(def), ...Reflect.ownKeys(sourceDef)]);

    for (const key of keys) {
        if (!COSMETIC_DEF_KEYS.has(key) && def[key] !== sourceDef[key]) {
            return false;
        }
    }

    return true;
}

/**
 * Sources of the schemas created by zod-to-x as copies of other schemas.
 */
const copySources = new WeakMap<object, object>();

/**
 * Links the copies of a schema created by zod-to-x to it: its definition references it, and Zod
 * copies the reference with the rest of the definition when a new schema is created from it.
 */
export function linkCopies(schema: object) {
    const def = (schema as any)._def;
    if (typeof def === "object" && def !== null) {
        def[SOURCE] = schema;
    }
}

/**
 * Links a schema created by zod-to-x as a copy of another one to it, and its copies to itself.
 */
export function linkToSource<T>(schema: T, source: unknown): T {
    if (schema !== source && typeof source === "object" && source !== null) {
        copySources.set(schema as object, source);
    }
    linkCopies(schema as object);
    return schema;
}

/**
 * Creates a copy of a schema. The copy inherits the metadata of the schema unless it has its own.
 */
export function cloneSchema<T extends ZodTypeAny>(schema: T): T {
    return linkToSource(new (schema as any).constructor({ ...schema._def }), schema);
}

/**
 * Returns the schema another schema was copied from, if it is linked to it.
 */
function getLinkedSource(schema: unknown): object | undefined {
    if (typeof schema !== "object" || schema === null) {
        return undefined;
    }

    const linked = copySources.get(schema);
    if (linked !== undefined) {
        return linked;
    }

    // Definitions are not modified once the schemas are created, except by `linkCopies`.
    const def = (schema as any)._def;
    const source = def?.[SOURCE];
    if (source === undefined || source === schema) {
        return undefined;
    }

    let cached = symbolSources.get(schema);
    if (cached === undefined || cached.source !== source) {
        cached = { source, isCopy: isCosmeticCopy(def, source._def) };
        symbolSources.set(schema, cached);
    }
    return cached.isCopy ? source : undefined;
}

/**
 * Whether the schema referenced by the definition of a schema is a schema it was copied from.
 */
const symbolSources = new WeakMap<object, { source: object; isCopy: boolean }>();

/**
 * Returns the key that a definition is indexed by: its first member that only its copies share.
 */
function getIndexKey(def: any): object | undefined {
    for (const key in def) {
        const value = def[key];
        if (
            ((typeof value === "object" && value !== null) || typeof value === "function") &&
            !COSMETIC_DEF_KEYS.has(key)
        ) {
            return value;
        }
    }

    return undefined;
}

/**
 * Schemas that copies are compared with, by the index key of their definition. Schemas with the
 * same structure represent the same type: only the first registered one is kept, as the source of
 * the copies of all of them.
 */
const copyTargets = new WeakMap<object, object[]>();

/**
 * Structural sources of schemas, found when `copyTargetsVersion` was the given one.
 */
const structuralSources = new WeakMap<object, { version: number; source?: object }>();
let copyTargetsVersion = 0;

/**
 * Registered schemas that copies are compared with, and their kinds. These schemas are not copies
 * of other schemas by structure.
 */
const targetSchemas = new WeakSet<object>();
const targetKinds = new Set<string>();

/**
 * Registers a schema with metadata or declared by a layered model, so its copies are found. The
 * schema is not modified if its copies can be found by their structure.
 */
export function registerCopySource(schema: object) {
    const def = (schema as any)._def;
    if (typeof def !== "object" || def === null || def[SOURCE] === schema) {
        return;
    }

    if (def[SOURCE] !== undefined) {
        // Copied from a schema created by zod-to-x, so its definition references that schema. It
        // references this schema instead, which keeps the link to that one.
        const source = getLinkedSource(schema);
        if (source !== undefined) {
            copySources.set(schema, source);
        }
        linkCopies(schema);
        return;
    }

    const key = STRUCTURAL_KINDS.has(def.typeName) ? getIndexKey(def) : undefined;
    if (key === undefined) {
        return; // Its copies are found by the layered models that declare it (`isDescribedCopy`).
    }

    const targets = copyTargets.get(key) ?? [];
    if (!targets.some((target) => isCosmeticCopy(def, (target as any)._def))) {
        targets.push(schema);
        copyTargets.set(key, targets);
        copyTargetsVersion++;
        targetSchemas.add(schema);
        targetKinds.add(def.typeName);
    }
}

/**
 * Returns the registered schema that a schema is a copy of, by structure. Links between copies
 * (by structure or not) only join schemas with the same structure, and the copies of a structure
 * are linked to its first registered schema, except the schemas it is linked to itself. So copy
 * sources never form a cycle.
 */
function findStructuralSource(schema: object): object | undefined {
    if (targetSchemas.has(schema)) {
        return undefined;
    }

    const def = (schema as any)._def;
    const key =
        typeof def === "object" && def !== null && targetKinds.has(def.typeName)
            ? getIndexKey(def)
            : undefined;
    const targets = key === undefined ? undefined : copyTargets.get(key);
    if (targets === undefined) {
        return undefined;
    }

    const cached = structuralSources.get(schema);
    if (cached?.version === copyTargetsVersion) {
        return cached.source;
    }

    let source = targets.find((target) => isCosmeticCopy(def, (target as any)._def));
    for (let current: unknown = source; current !== undefined; current = getLinkedSource(current)) {
        if (current === schema) {
            source = undefined;
            break;
        }
    }

    structuralSources.set(schema, { version: copyTargetsVersion, source });
    return source;
}

/**
 * Returns the key that the copies of a schema share, for the kinds of schemas whose copies are not
 * found by structure (see `isDescribedCopy`).
 */
export function getCopyKey(schema: unknown): object | undefined {
    const def = (schema as any)?._def;
    return typeof def === "object" && def !== null && !STRUCTURAL_KINDS.has(def.typeName)
        ? getIndexKey(def)
        : undefined;
}

/**
 * Checks if a schema is a copy of another one that changes its documentation (e.g. with
 * `.describe()`), by their structure. Schemas of kinds that are not compared by structure (see
 * `STRUCTURAL_KINDS`) are only compared with the schemas declared by the same layered model, and
 * equal schemas are not copies, as they can be created independently (e.g. `z.array(Item)`).
 */
export function isDescribedCopy(schema: unknown, source: unknown): boolean {
    const def = (schema as any)?._def;
    const sourceDef = (source as any)?._def;
    if (schema === source || !isCosmeticCopy(def, sourceDef)) {
        return false;
    }

    const keys = new Set([...Reflect.ownKeys(def), ...Reflect.ownKeys(sourceDef)]);
    return [...keys].some((key) => key !== SOURCE && def[key] !== sourceDef[key]);
}

/**
 * Returns the schema another schema was copied from without changing the type it represents
 * (e.g. `.describe()`, `.strict()`), if any.
 */
export function getCopySource(schema: unknown): object | undefined {
    return getLinkedSource(schema) ?? (schema ? findStructuralSource(schema as object) : undefined);
}

/**
 * Returns the metadata set on a schema itself, without the one inherited from the schema it was
 * copied from.
 */
export function getOwnZod2xMetadata(schema: unknown): IZod2xMetadata | undefined {
    return typeof schema === "object" && schema !== null ? store.get(schema) : undefined;
}

/**
 * Returns the metadata of a schema: its own metadata or, if it has none, the metadata of the
 * schema it was copied from by Zod without changing the type it represents.
 */
export function getZod2xMetadata(schema: unknown): IZod2xMetadata | undefined {
    let current: unknown = schema;

    while (current !== undefined && current !== null && typeof current === "object") {
        const metadata = store.get(current);
        if (metadata !== undefined) {
            return metadata;
        }

        current = getCopySource(current);
    }

    return undefined;
}

export function setZod2xMetadata<T extends object>(schema: T, metadata: IZod2xMetadata): T {
    store.set(schema, metadata);
    registerCopySource(schema);
    return schema;
}

/**
 * Template of a generic type instance, with the type used for it.
 */
export interface IZod2xGenericTemplate {
    schema: ZodTypeAny;
    typeName?: string;
    layer?: IZod2xLayerMetadata;
}

/**
 * Metadata of a schema with all the information derived from the referenced schemas.
 */
export interface IZod2xResolvedMetadata {
    typeName?: string;
    parentEnum?: ZodEnum<any> | ZodNativeEnum<any>;
    layer?: IZod2xLayerMetadata;

    /**
     * For Layered Modeling. Layer and type name of the type extended by a layer alias.
     */
    parentLayer?: IZod2xLayerMetadata;
    aliasOf?: string;

    /**
     * Description of the schema that the alias extends.
     */
    aliasedDescription?: string;

    /**
     * For Layered Modeling defining generics. Types used for each template of a generic type
     * instance, and name of the generic type.
     */
    genericTypes?: IZod2xGenericTemplate[];
    genericOf?: string;

    /**
     * For Layered Modeling defining generics.
     * Indicates if the type is a layer alias (true) or an instance of a generic type created with
     * `useGenericType` (false).
     */
    isGenericChild?: boolean;
}

/**
 * Returns the metadata of a schema to resolve.
 */
export type Zod2xMetadataLookup = (schema: unknown) => IZod2xMetadata | undefined;

/**
 * Lookup that adds the layered modeling metadata (type names and layers of the types declared by
 * layered models), which is not stored in the schemas but resolved from the created models.
 */
let layeredLookup: Zod2xMetadataLookup | undefined;

/**
 * Sets the lookup used by default to resolve the metadata of schemas. Used by layered modeling.
 */
export function setLayeredMetadataLookup(lookup: Zod2xMetadataLookup) {
    layeredLookup = lookup;
}

/**
 * Returns the metadata of a schema, resolving the information derived from the schemas it
 * references (original type of layer aliases, generic type and templates of generic instances).
 *
 * @param lookup - Returns the metadata of each schema. Defaults to the layered modeling lookup,
 *                 which falls back to the metadata set on the schemas.
 */
export function resolveZod2xMetadata(
    schema: unknown,
    lookup: Zod2xMetadataLookup = layeredLookup ?? getZod2xMetadata
): IZod2xResolvedMetadata | undefined {
    const metadata = lookup(schema);

    if (metadata === undefined) {
        return undefined;
    }

    if (metadata.aliasOf !== undefined) {
        const original = resolveZod2xMetadata(metadata.aliasOf, lookup);
        const isGenericInstance = original?.isGenericChild === false;

        return {
            typeName: metadata.typeName,
            layer: metadata.layer,
            parentLayer: original?.layer,
            aliasOf: original?.typeName,
            aliasedDescription: metadata.aliasOf.description,
            // Generics associated to the original type, but related to the alias.
            genericTypes: isGenericInstance ? original.genericTypes : undefined,
            genericOf: isGenericInstance ? original.genericOf : undefined,
            isGenericChild: true,
        };
    }

    if (metadata.genericOf !== undefined) {
        const generic = resolveZod2xMetadata(metadata.genericOf.generic, lookup);

        return {
            typeName: metadata.typeName ?? generic?.typeName,
            layer: metadata.layer ?? generic?.layer,
            genericTypes: metadata.genericOf.templates.map(([_key, template]) => {
                const templateMetadata = resolveZod2xMetadata(template, lookup);
                return {
                    schema: template,
                    typeName: templateMetadata?.typeName,
                    layer: templateMetadata?.layer,
                };
            }),
            genericOf: generic?.typeName,
            isGenericChild: false,
        };
    }

    return {
        typeName: metadata.typeName,
        parentEnum: metadata.parentEnum,
        layer: metadata.layer,
    };
}
