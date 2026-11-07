import type { ZodEnum, ZodNativeEnum, ZodTypeAny } from "zod";

import type { IZod2xLayerMetadata, IZod2xMetadata } from "./zod_ext";

/**
 * Zod2X metadata is stored out of the schemas, keyed by schema instance, instead of being
 * injected as a property into them.
 *
 * Zod 3 creates a new schema, copying its definition, for any change of a schema. The definition of
 * schemas with metadata (and of described schemas) keeps a reference to the schema it comes from,
 * so copies that only change its documentation or its unknown keys handling (`.describe()`,
 * `.strict()`, `.passthrough()`, ...) inherit its metadata unless they have their own. Copies that
 * change the type (`.extend()`, `.omit()`, `.pick()`, ...) are new types and do not inherit it.
 * Metadata is not merged with the source one: the closest metadata is used as a whole, so layer
 * aliases do not inherit fields from the original type.
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
 * Links a schema created from another one to it, so it can inherit its metadata. A schema is
 * never linked to itself: `setZod2xMetadata` does it when the schema gets its own metadata.
 */
export function linkToSource<T>(schema: T, source: unknown): T {
    const def = (schema as any)?._def;

    if (schema !== source && typeof def === "object" && def !== null) {
        def[SOURCE] = source;
    }

    return schema;
}

/**
 * Creates a copy of a schema. The copy inherits the metadata of the schema unless it has its own.
 */
export function cloneSchema<T extends ZodTypeAny>(schema: T): T {
    return linkToSource(new (schema as any).constructor({ ...schema._def }), schema);
}

/**
 * Returns the schema another schema was copied from by Zod, if the copy only changes cosmetic
 * keys of its definition (e.g. `.describe()`, `.strict()`), so both represent the same type.
 */
export function getCopySource(schema: unknown): object | undefined {
    const def = (schema as any)?._def;
    const source = def?.[SOURCE];

    if (source === undefined || source === schema || !isCosmeticCopy(def, source._def)) {
        return undefined;
    }

    return source;
}

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

    // Copies of the schema reference it, so they can inherit its metadata.
    const def = (schema as any)._def;
    if (typeof def === "object" && def !== null) {
        def[SOURCE] = schema;
    }

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
 * Returns the metadata of a schema, resolving the information derived from the schemas it
 * references (original type of layer aliases, generic type and templates of generic instances).
 */
export function resolveZod2xMetadata(schema: unknown): IZod2xResolvedMetadata | undefined {
    const metadata = getZod2xMetadata(schema);

    if (metadata === undefined) {
        return undefined;
    }

    if (metadata.aliasOf !== undefined) {
        const original = resolveZod2xMetadata(metadata.aliasOf);
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
        const generic = resolveZod2xMetadata(metadata.genericOf.generic);

        return {
            typeName: metadata.typeName ?? generic?.typeName,
            layer: metadata.layer ?? generic?.layer,
            genericTypes: metadata.genericOf.templates.map(([_key, template]) => {
                const templateMetadata = resolveZod2xMetadata(template);
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
