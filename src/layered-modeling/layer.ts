import Case from "case";

import { IZod2xLayerMetadata, IZod2xMetadata } from "@/lib/zod_ext";
import { ZodHelpers, ZodType } from "@/lib/zod_helpers";

enum EZod2XLayer {
    DOMAIN = 0,
    APPLICATION = 1,
    INFRASTRUCTURE = 2,
    PRESENTATION = 3,
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

                let metadata: IZod2xMetadata | undefined;

                /**
                 * Set metadata for each transpilerable property of the class if not already set.
                 * @param name
                 * @param zodItem
                 * @param opt
                 */
                const setMetadata = (name: string, zodItem: ZodType, opt: IZod2xLayerMetadata) => {
                    metadata = zodItem["_zod2x"];

                    if (metadata === undefined) {
                        metadata = {
                            typeName: name,
                        };

                        zodItem["_zod2x"] = metadata;
                    } else if (!metadata.typeName) {
                        // Only possible if `zod2xExtendable` is used.
                        metadata.typeName = name;
                    }

                    if (metadata.layer === undefined) {
                        // Metadata is set independently because typeName could already exist if
                        // zod2x was used before.
                        metadata.layer = opt;
                    }

                    if (opt.externalInheritance !== false && metadata.layer.file !== opt.file) {
                        // Type used from another layer. A new type is created inheriting the
                        // original type.
                        zodItem = ZodHelpers.cloneZod(zodItem);
                        zodItem._zod2x = {
                            parentLayer: metadata.layer,
                            aliasOf: metadata.typeName,
                            layer: opt,
                            typeName: name,
                        };
                    }

                    return zodItem;
                };

                Object.getOwnPropertyNames(this).forEach((prop) => {
                    const item = (this as any)[prop];

                    if (
                        ZodHelpers.isTranspilerableZodType(item) ||
                        ZodHelpers.isTranspilerableAliasedZodType(item, opt.basicTypes === false)
                    ) {
                        (this as any)[prop] = setMetadata(Case.pascal(prop), item, opt);
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
