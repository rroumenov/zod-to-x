import Case from "case";

import { IZod2xLayerMetadata } from "@/lib/zod_ext";
import { getZod2xMetadata, resolveZod2xMetadata, setZod2xMetadata } from "@/lib/zod2x_metadata";
import { ZodHelpers, ZodTypeAny } from "@/lib/zod_helpers";

enum EZod2XLayer {
    DOMAIN = 0,
    APPLICATION = 1,
    INFRASTRUCTURE = 2,
    PRESENTATION = 3,
}

/**
 * Model property that defines a type of a layer.
 */
interface ITypeOwnership {
    model: any;
    prop: string;
    name: string;
    layer: IZod2xLayerMetadata;

    /**
     * Type name set with zod2x before the type was used by a layer, if any.
     */
    userTypeName?: string;
}

/**
 * Model property where each type is defined. Used to move a type to a lower layer when it is used
 * by a higher layer first.
 */
const ownerships = new WeakMap<ZodTypeAny, ITypeOwnership>();

/**
 * Creates a new type that extends an existing one, which is referenced.
 */
function createLayerAlias(
    original: ZodTypeAny,
    layer: IZod2xLayerMetadata,
    name: string
): ZodTypeAny {
    return setZod2xMetadata(ZodHelpers.cloneZod(original), {
        typeName: name,
        layer,
        aliasOf: original,
    });
}

/**
 * Moves a type to a lower layer. The model of the higher layer that defined it uses an alias of
 * the type instead, as it would have done if the lower layer had been created first.
 */
function transferOwnership(zodItem: ZodTypeAny, owner: ITypeOwnership) {
    const previous = ownerships.get(zodItem);
    const userTypeName = previous?.userTypeName;

    setZod2xMetadata(zodItem, {
        ...getZod2xMetadata(zodItem),
        typeName: userTypeName || owner.name,
        layer: owner.layer,
    });
    ownerships.set(zodItem, { ...owner, userTypeName });

    if (
        previous !== undefined &&
        previous.model[previous.prop] === zodItem &&
        previous.layer.externalInheritance !== false
    ) {
        previous.model[previous.prop] = createLayerAlias(zodItem, previous.layer, previous.name);
    }
}

/**
 * A decorator function to create a layered model by extending a class with additional metadata.
 * This decorator ensures that each class instance is a singleton and associates metadata with
 * transpilerable properties of the class.
 *
 * @param opt - The metadata options for the layer, of type `IZod2xLayerMetadata`.
 *
 * @returns A class decorator that extends the target class with the following features:
 * - Singleton instance management.
 * - Automatic assignment of metadata (`IZod2xMetadata`) to transpilerable properties.
 * - Layer-specific metadata association for Zod types.
 *
 * ### Usage
 * Apply this decorator to a class to enable layered modeling and metadata management.
 *
 * ### Example
 * ```typescript
 * @Layer({ name: "User", file: "user.ts", index: 0 })
 * class ExampleClass {
 *   // Class implementation
 * }
 * ```
 *
 * ### Usage
 * It can also be used to create custom layers like Domain, Application or Infrastructure:
 * ```typescript
 * function Domain(opt: Pick<IZod2xLayerMetadata, "file" | "name">) {
 *   return Layer({ ...opt, index: EZod2XLayer.DOMAIN });
 * }
 *
 * @Domain({ name: "User", file: "user.ts" })
 * class User {
 *  // Class implementation
 * }
 * ```
 */
export function Layer(opt: IZod2xLayerMetadata) {
    return function <T extends { new (...args: any[]): {} }>(constructor: T) {
        return class extends constructor {
            static instance: T | null = null;

            public modelName = constructor.name;
            public layerMetadata = opt;

            constructor(...args: any[]) {
                if ((constructor as any).instance) {
                    return (constructor as any).instance;
                }

                super(...args);
                (constructor as any).instance = this as unknown as T;

                /**
                 * Set metadata for each transpilerable property of the class if not already set.
                 * @param prop - Property name. Its pascal case is used as type name.
                 * @param zodItem - Property schema.
                 * @returns The schema to use as property value.
                 */
                const setMetadata = (prop: string, zodItem: ZodTypeAny): ZodTypeAny => {
                    const name = Case.pascal(prop);
                    const own = getZod2xMetadata(zodItem);
                    const resolved = resolveZod2xMetadata(zodItem);
                    const isDerivedType =
                        own?.aliasOf !== undefined || own?.genericOf !== undefined;

                    if (!isDerivedType && resolved?.layer === undefined) {
                        // First use of the type: it belongs to this layer. A type name set with
                        // zod2x is kept.
                        setZod2xMetadata(zodItem, {
                            ...own,
                            typeName: own?.typeName || name,
                            layer: opt,
                        });
                        ownerships.set(zodItem, {
                            model: this,
                            prop,
                            name,
                            layer: opt,
                            userTypeName: own?.typeName,
                        });
                        return zodItem;
                    }

                    if (
                        !isDerivedType &&
                        resolved!.layer!.file !== opt.file &&
                        resolved!.layer!.index > opt.index
                    ) {
                        // Type used before by a higher layer: it is moved to this layer, so the
                        // result does not depend on the order in which models are created.
                        transferOwnership(zodItem, { model: this, prop, name, layer: opt });
                        return zodItem;
                    }

                    if (isDerivedType && resolved?.layer === undefined) {
                        // Instance of a generic type that does not belong to any layer.
                        setZod2xMetadata(zodItem, {
                            ...own,
                            layer: opt,
                            ...(resolved?.typeName ? {} : { typeName: name }),
                        });
                    }

                    const current = resolveZod2xMetadata(zodItem)!;
                    if (
                        opt.externalInheritance !== false &&
                        (current.layer!.file !== opt.file || name !== current.typeName)
                    ) {
                        // Using an existing type. A new type is created that inherits from the
                        // original type.
                        return createLayerAlias(zodItem, opt, name);
                    }

                    return zodItem;
                };

                const lazyProperties: any[] = [];
                Object.getOwnPropertyNames(this).forEach((prop) => {
                    const item = (this as any)[prop];

                    if (
                        ZodHelpers.isTranspilerableZodType(item) ||
                        ZodHelpers.isTranspilerableAliasedZodType(item, opt.basicTypes === false)
                    ) {
                        (this as any)[prop] = setMetadata(prop, item);
                    } else if (ZodHelpers.isZodLazy(item)) {
                        lazyProperties.push(prop);
                    }
                });

                // Process lazy properties after initial pass to ensure proper metadata assignment.
                lazyProperties.forEach((i) => {
                    const lazyItem = (this as any)[i]._def.getter();

                    if (
                        ZodHelpers.isTranspilerableZodType(lazyItem) ||
                        ZodHelpers.isTranspilerableAliasedZodType(
                            lazyItem,
                            opt.basicTypes === false
                        )
                    ) {
                        (this as any)[i] = setMetadata(i, lazyItem);
                    }
                });
            }
        };
    };
}

/**
 * The Domain layer decorator is typically used to define the core business logic or domain-specific
 * rules within the application. It serves as a foundational layer in the layered architecture,
 * encapsulating domain-related concerns.
 *
 * @param opt - An object containing the following properties:
 *   - `file`: The file path associated with the layer.
 *   - `name`: The name of the layer.
 *
 * @returns The configured Domain layer.
 */
export function Domain(opt: Omit<IZod2xLayerMetadata, "index">) {
    return Layer({ ...opt, index: EZod2XLayer.DOMAIN });
}

/**
 * The Application layer decorator is typically used to represent the application-specific logic
 * or configuration in a layered architecture. It serves as a higher-level abstraction
 * that interacts with other layers, such as domain or infrastructure layers.
 *
 * @param opt - An object containing the following properties:
 *   - `file`: The file associated with the layer.
 *   - `name`: The name of the layer.
 *
 * @returns The result of invoking the `Layer` function with the provided options and
 *          the `APPLICATION` layer index.
 */
export function Application(opt: Omit<IZod2xLayerMetadata, "index">) {
    return Layer({ ...opt, index: EZod2XLayer.APPLICATION });
}

/**
 * The Infrastructure layer decorator is typically responsible for handling
 * low-level technical details such as database access, external APIs,
 * file systems, and other system-level operations. It serves as the
 * foundation for higher-level layers in the architecture.
 *
 * @param opt - An object containing metadata for the layer:
 *   - `file`: The file associated with this layer.
 *   - `name`: The name of the layer.
 *
 * @returns A configured Infrastructure layer.
 */
export function Infrastructure(opt: Omit<IZod2xLayerMetadata, "index">) {
    return Layer({ ...opt, index: EZod2XLayer.INFRASTRUCTURE });
}

/**
 * The Presentation layer decorator is typically used to define the presentation or view-specific
 * aspects of the model, such as formatting or display-related metadata.
 *
 * @param opt - An object containing the following properties:
 *   - `file`: The file associated with the layer.
 *   - `name`: The name of the layer.
 * @returns The configured Presentation layer.
 */
export function Presentation(opt: Omit<IZod2xLayerMetadata, "index">) {
    return Layer({ ...opt, index: EZod2XLayer.PRESENTATION });
}
