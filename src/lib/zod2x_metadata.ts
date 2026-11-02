import type { ZodEnum, ZodType } from "zod/v4";

import type { IZod2xLayerMetadata, IZod2xMetadata } from "./zod_ext";

/**
 * Zod2X metadata is stored out of the schemas, keyed by schema instance, instead of being
 * injected as a property into them.
 *
 * Schemas cloned by Zod without modifying their definition (`.describe()`, `.meta()`,
 * `.clone()`) keep a reference to their parent schema, so they inherit its metadata unless they
 * have their own. Unlike Zod registries, metadata is not merged with the parent one: the closest
 * metadata is used as a whole, so layer aliases do not inherit fields from the original type.
 */
const store = new WeakMap<object, IZod2xMetadata>();

export function getZod2xMetadata(schema: unknown): IZod2xMetadata | undefined {
    let current: any = schema;

    while (current !== undefined && current !== null && typeof current === "object") {
        const metadata = store.get(current);
        if (metadata !== undefined) {
            return metadata;
        }
        current = current._zod?.parent;
    }

    return undefined;
}

export function setZod2xMetadata<T extends object>(schema: T, metadata: IZod2xMetadata): T {
    store.set(schema, metadata);
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
