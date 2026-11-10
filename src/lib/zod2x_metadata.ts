import type { ZodEnum, ZodType } from "zod/v4";

import type { IZod2xLayerMetadata, IZod2xMetadata } from "./zod_ext";

/**
 * Zod2X metadata is stored out of the schemas, keyed by schema instance, instead of being
 * injected as a property into them. Schemas created by the user are never modified.
 *
 * Schemas cloned by Zod without modifying their definition (`.describe()`, `.meta()`,
 * `.clone()`) keep a reference to their parent schema. Object copies that only change the unknown
 * keys policy (`.strict()`, `.strip()`, `.passthrough()`, `.loose()`, `.catchall()`) do not, so
 * they are found by their structure: they have the same members as the schema they were copied
 * from. Copies inherit the metadata of the schema they come from unless they have their own.
 * Unlike Zod registries, metadata is not merged with the parent one: the closest metadata is used
 * as a whole, so layer aliases do not inherit fields from the original type.
 */
const store = new WeakMap<object, IZod2xMetadata>();

/**
 * Source schema of copies of schemas created by zod-to-x (see `linkCopies`).
 */
const copySources = new WeakMap<object, object>();

/**
 * Schemas created by zod-to-x whose copies are linked to them.
 */
const linkedSchemas = new WeakSet<object>();

/**
 * A definition of the object schemas that copies are compared with. Definitions that only differ
 * in their unknown keys policy represent the same type: the first registered one is canonical,
 * and its target is the first registered schema that uses it (see `registerCopySource`).
 */
interface ICanonicalDef {
    def: object;
    target: object;

    /**
     * Shape of the definition when it was registered. Zod builds the shape of an object when it is
     * first read, so copies created before can have the members it had before.
     */
    shape?: object;
}

/**
 * Canonical definitions, by the index key of their shape (see `getIndexKey`), and by definition.
 */
const canonicalDefsByMember = new WeakMap<object, ICanonicalDef[]>();
const canonicalDefs = new WeakMap<object, ICanonicalDef>();

/**
 * Definition keys that do not change the transpiled type. Zod represents the unknown keys policy
 * of object schemas (`.strict()`, `.strip()`, `.passthrough()`, `.loose()`, `.catchall()`) with
 * `catchall`.
 */
const COSMETIC_DEF_KEYS = new Set<PropertyKey>(["catchall"]);

/**
 * Returns what identifies a member of a definition container: its value or, for members defined
 * with a getter (e.g. recursive object members), the getter itself. Getters are not called, as
 * they can reference schemas that are not initialized yet and return a new schema on each call.
 */
function getMemberIdentity(container: object, key: PropertyKey): unknown {
    const descriptor = Object.getOwnPropertyDescriptor(container, key);
    return descriptor === undefined ? undefined : (descriptor.get ?? descriptor.value);
}

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
    return (
        keysA.length === keysB.length &&
        keysA.every((key) => getMemberIdentity(a, key) === getMemberIdentity(b, key))
    );
}

/**
 * Returns the shape of an object definition, if it can be read. Zod builds the shape when it is
 * first read, calling the getters of its members (which can reference schemas that are not
 * initialized yet). Zod 4.6+ keeps the members it builds the shape from in its accessor, so they
 * are read without building it. With `build: false`, shapes that are not built yet are not read.
 */
function readShape(def: any, build = true): object | undefined {
    const descriptor = Object.getOwnPropertyDescriptor(def, "shape");
    if (descriptor === undefined || descriptor.get === undefined) {
        return descriptor?.value;
    }

    if (typeof (descriptor.get as any).raw === "object") {
        return (descriptor.get as any).raw;
    }

    if (!build) {
        return undefined;
    }

    try {
        return def.shape;
    } catch {
        return undefined; // A member references a schema that is not initialized yet.
    }
}

/**
 * Returns the identity of a member if it can be used as an index key.
 */
function asIndexKey(member: unknown): object | undefined {
    return (typeof member === "object" && member !== null) || typeof member === "function"
        ? member
        : undefined;
}

/**
 * Returns the key that a shape is indexed by: its first member defined with a value, which is kept
 * when Zod builds the shape (members defined with a getter are replaced by the schemas they
 * return), or its first member if all are defined with getters.
 */
function getIndexKey(shape: object): object | undefined {
    let first: object | undefined;

    for (const key in shape) {
        const descriptor = Object.getOwnPropertyDescriptor(shape, key);
        if (descriptor?.get === undefined) {
            const member = asIndexKey(descriptor?.value);
            if (member !== undefined) {
                return member;
            }
        }
        first ??= asIndexKey(descriptor?.get);
    }

    return first;
}

/**
 * Checks if a definition only differs from another one in keys that do not change the type.
 * Shapes are compared with the given ones, as they are read without building them if possible.
 */
function isCosmeticDefChange(
    def: any,
    sourceDef: any,
    shape: object | undefined = readShape(def),
    sourceShapes: (object | undefined)[] = [readShape(sourceDef)]
): boolean {
    if (typeof def !== "object" || def === null || typeof sourceDef !== "object") {
        return false;
    }

    const keys = new Set([...Reflect.ownKeys(def), ...Reflect.ownKeys(sourceDef)]);

    for (const key of keys) {
        if (
            key !== "shape" &&
            !COSMETIC_DEF_KEYS.has(key) &&
            !isSameDefValue(def[key], sourceDef[key])
        ) {
            return false;
        }
    }

    return keys.has("shape")
        ? sourceShapes.some((sourceShape) => isSameDefValue(shape, sourceShape))
        : true;
}

/**
 * Checks if an object definition only differs from a canonical definition in its unknown keys
 * policy. Its shape is compared with the shape the canonical definition had when it was
 * registered, and with its current one.
 */
function isCopyOf(def: object, shape: object, canonical: ICanonicalDef): boolean {
    return isCosmeticDefChange(def, canonical.def, shape, [
        canonical.shape,
        readShape(canonical.def),
    ]);
}

/**
 * Returns the canonical definition that an object definition is a copy of, if any.
 */
function findCanonicalDef(def: object, shape: object): ICanonicalDef | undefined {
    // Any member can be the index key of the canonical definition, depending on when Zod built
    // the shapes.
    for (const key in shape) {
        const member = asIndexKey(getMemberIdentity(shape, key));
        const entries = member === undefined ? undefined : canonicalDefsByMember.get(member);
        const canonical = entries?.find(
            (entry) => entry.def !== def && isCopyOf(def, shape, entry)
        );
        if (canonical !== undefined) {
            return canonical;
        }
    }

    return undefined;
}

/**
 * Schemas registered as copy sources, with their shape when it could be read without building it.
 * They are indexed when copies are looked up, as their shape can reference schemas that are not
 * initialized while they are defined.
 */
const pendingSources: { schema: object; shape?: object }[] = [];

/**
 * Indexes the pending copy sources, in registration order. Their definition becomes canonical if
 * no registered definition represents their type. When the shape of a schema cannot be read yet,
 * it and the schemas registered after it are indexed later: canonical definitions follow the
 * registration order, so the copy sources of schemas created later never lead back to them.
 */
function indexPendingSources() {
    let indexed = 0;

    for (; indexed < pendingSources.length; indexed++) {
        const source = pendingSources[indexed];
        const def = (source.schema as any)._zod.def;
        const shape = readShape(def);

        if (shape === undefined) {
            break;
        }

        if (!canonicalDefs.has(def) && findCanonicalDef(def, shape) === undefined) {
            const canonical: ICanonicalDef = { def, target: source.schema, shape: source.shape };
            canonicalDefs.set(def, canonical);

            const keys = new Set([getIndexKey(shape), source.shape && getIndexKey(source.shape)]);
            keys.forEach((key) => {
                if (key !== undefined) {
                    const entries = canonicalDefsByMember.get(key) ?? [];
                    entries.push(canonical);
                    canonicalDefsByMember.set(key, entries);
                }
            });
        }
    }

    if (indexed > 0) {
        pendingSources.splice(0, indexed);
    }
}

/**
 * Returns the schema that an object schema is a copy of, by structure: the target of the
 * canonical definition that only differs from its definition in the unknown keys policy. Schemas
 * using a canonical definition are not copies by structure, so copy sources never form a cycle:
 * the other copy sources (`_zod.parent`, `linkCopies`) are older schemas. Objects without members
 * are not compared, as they have nothing to tell them apart.
 */
function findStructuralSource(schema: object): object | undefined {
    const def = (schema as any)._zod?.def;
    if (def?.type !== "object") {
        return undefined;
    }

    indexPendingSources();

    if (canonicalDefs.has(def)) {
        return undefined;
    }

    const shape = readShape(def);
    const target = shape === undefined ? undefined : findCanonicalDef(def, shape)?.target;
    if (target !== undefined) {
        // Kept, as Zod can rebuild the members of the copy later (when its shape is first read).
        copySources.set(schema, target);
    }

    return target;
}

/**
 * Registers an object schema with metadata or declared by a layered model, so its copies are
 * found by structure. Schemas are compared in registration order.
 */
export function registerCopySource(schema: object) {
    const def = (schema as any)._zod?.def;
    if (def?.type === "object") {
        pendingSources.push({ schema, shape: readShape(def, false) });
    }
}

/**
 * Links the copies of a schema created by zod-to-x (the handles of layered model properties) to
 * it, as copies of different handles of the same type cannot be told apart by their structure.
 * Every Zod method that copies a schema clones it through its `clone` method, which is wrapped on
 * the schema instance (Zod's prototypes are not modified). Copies are linked to their own copies
 * too. Schemas created by the user are never wrapped.
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

    return (schema as any)._zod?.parent ?? copySources.get(schema) ?? findStructuralSource(schema);
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
     * Description of the type that an alias extends, if the alias does not document itself.
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
            aliasedDescription: metadata.aliasedDescription,
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
