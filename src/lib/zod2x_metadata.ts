import type { ZodEnum, ZodType } from "zod/v4";

import type { IZod2xLayerMetadata, IZod2xMetadata } from "./zod_ext";

/**
 * Zod2X metadata is stored out of the schemas, keyed by schema instance, instead of being
 * injected as a property into them.
 *
 * Schemas cloned by Zod without modifying their definition (`.describe()`, `.meta()`,
 * `.clone()`) keep a reference to their parent schema, and copies of schemas with metadata that
 * only change the unknown keys policy of an object (`.strict()`, `.strip()`, `.passthrough()`,
 * `.loose()`, `.catchall()`) are linked to the schema they were copied from, so they inherit its
 * metadata unless they have their own. Unlike Zod registries, metadata is not merged with the parent one: the closest metadata is
 * used as a whole, so layer aliases do not inherit fields from the original type.
 */
const store = new WeakMap<object, IZod2xMetadata>();

/**
 * Source schema of object schemas copied with a different unknown keys policy. Zod does not keep
 * a reference to their parent, as their definition changes, but they represent the same type.
 */
const copySources = new WeakMap<object, object>();

/**
 * Schemas whose copies are linked to them.
 */
const linkedSchemas = new WeakSet<object>();

/**
 * Definition keys that do not change the transpiled type. Zod represents the unknown keys policy
 * of object schemas (`.strict()`, `.strip()`, `.passthrough()`, `.loose()`, `.catchall()`) with
 * `catchall`.
 */
const COSMETIC_DEF_KEYS = new Set<PropertyKey>(["catchall"]);

/**
 * Checks if two definition values are the same. Copies created by Zod can rebuild container
 * values (e.g. the `shape` of an object), so containers are compared by their members.
 */
function isSameDefValue(a: any, b: any): boolean {
    if (a === b) {
        return true;
    }

    if (
        typeof a !== "object" ||
        typeof b !== "object" ||
        a === null ||
        b === null ||
        "_zod" in a ||
        "_zod" in b ||
        Array.isArray(a) !== Array.isArray(b)
    ) {
        return false;
    }

    const keysA = Reflect.ownKeys(a);
    const keysB = Reflect.ownKeys(b);
    return keysA.length === keysB.length && keysA.every((key) => a[key] === b[key]);
}

/**
 * Checks if a definition only differs from another one in keys that do not change the type.
 */
function isCosmeticDefChange(def: any, sourceDef: any): boolean {
    if (typeof def !== "object" || def === null || typeof sourceDef !== "object") {
        return false;
    }

    const keys = new Set([...Reflect.ownKeys(def), ...Reflect.ownKeys(sourceDef)]);

    for (const key of keys) {
        if (!COSMETIC_DEF_KEYS.has(key) && !isSameDefValue(def[key], sourceDef[key])) {
            return false;
        }
    }

    return true;
}

/**
 * Links the copies of a schema to it. Every Zod method that copies a schema without changing the
 * type it represents (`.describe()`, `.meta()`, `.strict()`, `.passthrough()`, ...) clones it
 * through its `clone` method, which is wrapped on the schema instance (Zod's prototypes are not
 * modified). Zod keeps a reference to the parent of copies with the same definition; copies with
 * a different unknown keys policy are linked here. Copies are linked to their own copies too.
 */
export function linkCopies(schema: object) {
    const clone = (schema as any).clone;

    if (linkedSchemas.has(schema) || typeof clone !== "function") {
        return;
    }
    linkedSchemas.add(schema);

    (schema as any).clone = function (this: any, ...args: any[]) {
        const copy = clone.apply(this ?? schema, args);

        if (typeof copy === "object" && copy !== null && copy !== schema && "_zod" in copy) {
            if (
                copy._zod.parent === undefined &&
                isCosmeticDefChange(copy._zod.def, (schema as any)._zod?.def)
            ) {
                copySources.set(copy, schema);
            }
            linkCopies(copy);
        }

        return copy;
    };
}

/**
 * Returns the schema another schema was copied from by Zod without changing the type it
 * represents (e.g. `.describe()`, `.strict()`), if any.
 */
export function getCopySource(schema: unknown): object | undefined {
    if (typeof schema !== "object" || schema === null) {
        return undefined;
    }

    return (schema as any)._zod?.parent ?? copySources.get(schema);
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
    linkCopies(schema);
    return schema;
}

/**
 * Template of a generic type instance, with the type used for it.
 */
export interface IZod2xGenericTemplate {
    schema: ZodType;
    typeName?: string;
    layer?: IZod2xLayerMetadata;
}

/**
 * Metadata of a schema with all the information derived from the referenced schemas.
 */
export interface IZod2xResolvedMetadata {
    typeName?: string;
    parentEnum?: ZodEnum<any>;
    layer?: IZod2xLayerMetadata;

    /**
     * For Layered Modeling. Layer and type name of the type extended by a layer alias.
     */
    parentLayer?: IZod2xLayerMetadata;
    aliasOf?: string;

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
