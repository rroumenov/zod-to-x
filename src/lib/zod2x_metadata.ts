import type { IZod2xMetadata } from "./zod_ext";

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
