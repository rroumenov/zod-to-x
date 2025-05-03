import {
    EnumLike,
    UnknownKeysParam,
    z,
    ZodEnum,
    ZodNativeEnum,
    ZodRawShape,
    ZodTypeAny,
    ZodUnionOptions,
} from "zod";

export interface IZod2xLayerMetadata {
    /**
     * The file where the schema is transpiled. Used to allow importing types from other files.
     * Do not include the file extension.
     *
     * For example, "users_file" will be transpiled in Typescript as "import * from 'users_file'".
     */
    file: string;

    /**
     * The layer namespace. Used to group imports from the same file.
     *
     * @remarks
     * - Overrides namespace of transpilers that already support it as option, such as Zod2Cpp.
     *
     * For example, if named "user_types", in Typescript will be transpiled as
     * "import * as user_types from 'users_file'".
     */
    namespace: string;

    /**
     * The layer number. Used to allow importing types from other layers. A layer can only import
     * from layers with the same or lower number.
     *
     * For example, if the current layer is 2, it can import from layers 2, 1, and 0, but not
     * from layer 3.
     */
    index: number;

    /**
     * Indicates if types inherited from other layers should be transpiled as extendable types and
     * then used (true) or just used as imports (false).
     *
     * For example:
     * // Definition
     * class MyModels extends Zod2XModel {
     *   myType: ExternalNamespace.OtherType
     * }
     *
     * Case true:
     *   // Output example for typescript:
     *   import * as ExternalNamespace from "external_file";
     *
     *   interface MyType extends ExternalNamespace.OtherType {}
     *
     *   interface MyModels {
     *     myType: MyType;
     *   }
     *
     * Case false:
     *   // Output example for typescript:
     *   import * as ExternalNamespace from "external_file";
     *
     *   interface MyModels {
     *     myType: ExternalNamespace.OtherType;
     *   }
     */
    externalInheritance?: boolean;
}

export interface IZod2xMetadata {
    /**
     * The type name to use in the generated schema.
     */
    typeName: string;

    /**
     * For literal types, the parent enum that contains the literal value. Useful when using
     * ZodDiscriminatedUnion schemas.
     */
    parentEnum?: ZodEnum<any> | ZodNativeEnum<any>;

    /**
     * For Layered Modeling.
     * The file where the schema is transpiled. Used to allow importing types from other files.
     */
    layer?: IZod2xLayerMetadata;

    /**
     * For Layered Modeling.
     * When a type of another file is used without modifying it, by default it is sustituted by
     * the import without creating a new type. If wanted. it can be forced to create a new type
     * which will be the extension of the original type if `zod2xExtendable` is used.
     */
    aliasOf?: string;
    parentLayer?: IZod2xLayerMetadata;
}

declare module "zod" {
    interface ZodType {
        _zod2x?: IZod2xMetadata;
    }

    interface ZodObject<
        T extends ZodRawShape,
        UnknownKeys extends UnknownKeysParam = UnknownKeysParam,
        Catchall extends ZodTypeAny = ZodTypeAny,
    > {
        /**
         * Creates a new Zod object with the specified `typeName` metadata property.
         *
         * @param typeName - The name of the type to set in the metadata.
         * @returns A new instance of the Zod object with the `typeName` property.
         */
        zod2x(this: ZodObject<T, UnknownKeys, Catchall>, typeName: string): this;

        /**
         * Creates a new Zod object with the specified metadata properties.
         *
         * @param opt - An object containing the metadata properties to set.
         * @returns A new instance of the Zod object with the metadata properties.
         */
        zod2x(
            this: ZodObject<T, UnknownKeys, Catchall>,
            opt: Pick<IZod2xMetadata, "typeName">
        ): this;

        /**
         * Updates the current Zod object by modifying a specific metadata property.
         *
         * @param key - The key of the metadata property to update (e.g., `typeName`).
         * @param value - The new value to set for the specified metadata property.
         * @returns The current instance of the Zod object with the updated metadata property.
         */
        zod2x<K extends keyof Pick<IZod2xMetadata, "typeName">>(
            this: ZodObject<T, UnknownKeys, Catchall>,
            key: K,
            value: IZod2xMetadata[K]
        ): this;
    }

    interface ZodEnum<T extends [string, ...string[]]> {
        /**
         * Creates a new Zod enum with the specified `typeName` metadata property.
         *
         * @param typeName - The name of the type to set in the metadata.
         * @returns A new instance of the Zod enum with the `typeName` property.
         */
        zod2x(this: ZodEnum<T>, typeName: string): this;

        /**
         * Creates a new Zod enum with the specified metadata properties.
         *
         * @param opt - An object containing the metadata properties to set.
         * @returns A new instance of the Zod enum with the metadata properties.
         */
        zod2x(this: ZodEnum<T>, opt: Pick<IZod2xMetadata, "typeName">): this;

        /**
         * Updates the current Zod enum by modifying a specific metadata property.
         *
         * @param key - The key of the metadata property to update (e.g., `typeName`).
         * @param value - The new value to set for the specified metadata property.
         * @returns The current instance of the Zod enum with the updated metadata property.
         */
        zod2x<K extends keyof Pick<IZod2xMetadata, "typeName">>(
            this: ZodEnum<T>,
            key: K,
            value: IZod2xMetadata[K]
        ): this;
    }

    interface ZodNativeEnum<T extends EnumLike = EnumLike> {
        /**
         * Creates a new Zod native enum with the specified `typeName` metadata property.
         *
         * @param typeName - The name of the type to set in the metadata.
         * @returns A new instance of the Zod native enum with the `typeName` property.
         */
        zod2x(this: ZodNativeEnum<T>, typeName: string): this;

        /**
         * Creates a new Zod native enum with the specified metadata properties.
         *
         * @param opt - An object containing the metadata properties to set.
         * @returns A new instance of the Zod native enum with the metadata properties.
         */
        zod2x(this: ZodNativeEnum<T>, opt: Pick<IZod2xMetadata, "typeName">): this;

        /**
         * Updates the current Zod native enum by modifying a specific metadata property.
         *
         * @param key - The key of the metadata property to update (e.g., `typeName`).
         * @param value - The new value to set for the specified metadata property.
         * @returns The current instance of the Zod native enum with the updated metadata property.
         */
        zod2x<K extends keyof Pick<IZod2xMetadata, "typeName">>(
            this: ZodNativeEnum<T>,
            key: K,
            value: IZod2xMetadata[K]
        ): this;
    }

    // @ts-ignore: TS2345 - zod>=3.24.0 uses readonly. Previous versions use mutable.
    interface ZodDiscriminatedUnion<
        Discriminator extends string,
        Options extends readonly z.ZodDiscriminatedUnionOption<Discriminator>[],
    > {
        /**
         * Creates a new Zod discriminated union with the specified `typeName` metadata property.
         *
         * @param typeName - The name of the type to set in the metadata.
         * @returns A new instance of the Zod discriminated union with the `typeName` property.
         */
        zod2x(this: ZodDiscriminatedUnion<Discriminator, Options>, typeName: string): this;

        /**
         * Creates a new Zod discriminated union with the specified metadata properties.
         *
         * @param opt - An object containing the metadata properties to set.
         * @returns A new instance of the Zod discriminated union with the metadata properties.
         */
        zod2x(
            this: ZodDiscriminatedUnion<Discriminator, Options>,
            opt: Pick<IZod2xMetadata, "typeName">
        ): this;

        /**
         * Updates the current Zod discriminated union by modifying a specific metadata property.
         *
         * @param key - The key of the metadata property to update (e.g., `typeName`).
         * @param value - The new value to set for the specified metadata property.
         * @returns The current instance of the Zod discriminated union with the updated metadata property.
         */
        zod2x<K extends keyof Pick<IZod2xMetadata, "typeName">>(
            this: ZodDiscriminatedUnion<Discriminator, Options>,
            key: K,
            value: IZod2xMetadata[K]
        ): this;
    }

    interface ZodUnion<T extends ZodUnionOptions> {
        /**
         * Creates a new Zod union with the specified `typeName` metadata property.
         *
         * @param typeName - The name of the type to set in the metadata.
         * @returns A new instance of the Zod union with the `typeName` property.
         */
        zod2x(this: ZodUnion<ZodUnionOptions>, typeName: string): this;

        /**
         * Creates a new Zod union with the specified metadata properties.
         *
         * @param opt - An object containing the metadata properties to set.
         * @returns A new instance of the Zod union with the metadata properties.
         */
        zod2x(this: ZodUnion<ZodUnionOptions>, opt: Pick<IZod2xMetadata, "typeName">): this;

        /**
         * Updates the current Zod union by modifying a specific metadata property.
         *
         * @param key - The key of the metadata property to update (e.g., `typeName`).
         * @param value - The new value to set for the specified metadata property.
         * @returns The current instance of the Zod union with the updated metadata property.
         */
        zod2x<K extends keyof Pick<IZod2xMetadata, "typeName">>(
            this: ZodUnion<ZodUnionOptions>,
            key: K,
            value: IZod2xMetadata[K]
        ): this;
    }

    interface ZodIntersection<T extends ZodTypeAny, U extends ZodTypeAny> {
        /**
         * Creates a new Zod intersection with the specified `typeName` metadata property.
         *
         * @param typeName - The name of the type to set in the metadata.
         * @returns A new instance of the Zod intersection with the `typeName` property.
         */
        zod2x(this: ZodIntersection<T, U>, typeName: string): this;

        /**
         * Creates a new Zod intersection with the specified metadata properties.
         *
         * @param opt - An object containing the metadata properties to set.
         * @returns A new instance of the Zod intersection with the metadata properties.
         */
        zod2x(this: ZodIntersection<T, U>, opt: Pick<IZod2xMetadata, "typeName">): this;

        /**
         * Updates the current Zod intersection by modifying a specific metadata property.
         *
         * @param key - The key of the metadata property to update (e.g., `typeName`).
         * @param value - The new value to set for the specified metadata property.
         * @returns The current instance of the Zod intersection with the updated metadata property.
         */
        zod2x<K extends keyof Pick<IZod2xMetadata, "typeName">>(
            this: ZodIntersection<T, U>,
            key: K,
            value: IZod2xMetadata[K]
        ): this;
    }

    interface ZodLiteral<T extends ZodTypeAny> {
        /**
         * Creates a new Zod literal with the specified `parentEnum` metadata property.
         *
         * @param parentEnum - The parent enum that contains the literal value. This can be either a `ZodNativeEnum` or a `ZodEnum`.
         * @returns A new instance of the Zod literal with the updated `parentEnum` property.
         */
        zod2x(this: ZodLiteral<T>, parentEnum: ZodNativeEnum | ZodEnum<any>): this;

        /**
         * Creates a new Zod literal with the specified metadata properties.
         *
         * @param opt - An object containing the metadata properties to set, such as `parentEnum`.
         * @returns A new instance of the Zod literal with the metadata properties.
         */
        zod2x(this: ZodLiteral<T>, opt: Pick<IZod2xMetadata, "parentEnum">): this;
    }
}

function getZod2XConstructor() {
    return function <K extends keyof IZod2xMetadata>(
        this: any,
        opt: string | IZod2xMetadata | K,
        value?: IZod2xMetadata[K]
    ) {
        if (typeof opt === "string" && value !== undefined) {
            this._zod2x[opt] = value;
            return this;
        }

        const newItem = new (this as any).constructor({ ...this._def });
        newItem._zod2x = typeof opt === "string" ? { typeName: opt } : opt;

        return newItem;
    };
}

/**
 * Extends the Zod library by adding custom methods to its prototypes, enabling
 * additional functionality required by the `zod-to-x` package. This function
 * must be executed after importing Zod to ensure the extensions are applied
 * correctly.
 *
 * @param zod - The Zod library instance to be extended. This is typically the
 *              default export or namespace import from the `zod` package.
 *
 * @remarks
 * This function modifies the prototypes of several Zod types, including
 * `ZodObject`, `ZodEnum`, `ZodNativeEnum`, `ZodDiscriminatedUnion`,
 * `ZodUnion`, `ZodIntersection`, and `ZodLiteral`. It ensures that each type
 * has a `zod2x` method, which is required for the `zod-to-x` package to
 * function properly.
 *
 * Usage:
 * ```typescript
 * import * as zod from "zod";
 * import { extendZod } from "zod-to-x";
 *
 * extendZod(zod);
 * ```
 */
export function extendZod(zod: any /*typeof z ---> any type until solve type incompatibilities*/) {
    // Ensure single definitions

    if (typeof zod.ZodObject.prototype.zod2x === "undefined") {
        zod.ZodObject.prototype.zod2x = getZod2XConstructor();
    }

    if (typeof zod.ZodEnum.prototype.zod2x === "undefined") {
        zod.ZodEnum.prototype.zod2x = getZod2XConstructor();
    }

    if (typeof zod.ZodNativeEnum.prototype.zod2x === "undefined") {
        zod.ZodNativeEnum.prototype.zod2x = getZod2XConstructor();
    }

    if (typeof zod.ZodDiscriminatedUnion.prototype.zod2x === "undefined") {
        zod.ZodDiscriminatedUnion.prototype.zod2x = getZod2XConstructor();
    }

    if (typeof zod.ZodUnion.prototype.zod2x === "undefined") {
        zod.ZodUnion.prototype.zod2x = getZod2XConstructor();
    }

    if (typeof zod.ZodIntersection.prototype.zod2x === "undefined") {
        zod.ZodIntersection.prototype.zod2x = getZod2XConstructor();
    }

    if (typeof zod.ZodLiteral.prototype.zod2x === "undefined") {
        zod.ZodLiteral.prototype.zod2x = function (
            this: any,
            opt: ZodNativeEnum | ZodEnum<any> | Pick<IZod2xMetadata, "parentEnum">
        ) {
            const newItem = new (this as any).constructor({ ...this._def });
            newItem._zod2x =
                opt instanceof zod.ZodEnum || opt instanceof zod.ZodNativeEnum
                    ? { parentEnum: opt }
                    : opt;

            return newItem;
        };
    }
}
