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

export interface Zod2xMetadata {
    /**
     * The type name to use in the generated schema.
     */
    typeName: string;

    /**
     * For literal types, the parent enum that contains the literal value. Useful when using
     * ZodDiscriminatedUnion schemas.
     */
    parentEnum?: ZodEnum<any> | ZodNativeEnum<any>;
}

declare module "zod" {
    interface ZodTypeDef {
        zod2x?: Zod2xMetadata;
    }

    interface ZodObject<
        T extends ZodRawShape,
        UnknownKeys extends UnknownKeysParam = UnknownKeysParam,
        Catchall extends ZodTypeAny = ZodTypeAny,
    > {
        zod2x(this: ZodObject<T, UnknownKeys, Catchall>, typeName: string): this;
        zod2x(
            this: ZodObject<T, UnknownKeys, Catchall>,
            opt: Pick<Zod2xMetadata, "typeName">
        ): this;
    }

    interface ZodEnum<T extends [string, ...string[]]> {
        zod2x(this: ZodEnum<T>, typeName: string): this;
        zod2x(this: ZodEnum<T>, opt: Pick<Zod2xMetadata, "typeName">): this;
    }

    interface ZodNativeEnum<T extends EnumLike = EnumLike> {
        zod2x(this: ZodNativeEnum<T>, typeName: string): this;
        zod2x(this: ZodNativeEnum<T>, opt: Pick<Zod2xMetadata, "typeName">): this;
    }

    interface ZodDiscriminatedUnion<
        Discriminator extends string,
        Options extends z.ZodDiscriminatedUnionOption<Discriminator>[],
    > {
        zod2x(this: ZodDiscriminatedUnion<Discriminator, Options>, typeName: string): this;
        zod2x(
            this: ZodDiscriminatedUnion<Discriminator, Options>,
            opt: Pick<Zod2xMetadata, "typeName">
        ): this;
    }

    interface ZodUnion<T extends ZodUnionOptions> {
        zod2x(this: ZodUnion<ZodUnionOptions>, typeName: string): this;
        zod2x(this: ZodUnion<ZodUnionOptions>, opt: Pick<Zod2xMetadata, "typeName">): this;
    }

    interface ZodIntersection<T extends ZodTypeAny, U extends ZodTypeAny> {
        zod2x(this: ZodIntersection<T, U>, typeName: string): this;
        zod2x(this: ZodIntersection<T, U>, opt: Pick<Zod2xMetadata, "typeName">): this;
    }

    interface ZodLiteral<T extends ZodTypeAny> {
        zod2x(this: ZodLiteral<T>, parentEnum: ZodNativeEnum | ZodEnum<any>): this;
        zod2x(this: ZodLiteral<T>, opt: Pick<Zod2xMetadata, "parentEnum">): this;
    }
}

function getZod2XConstructor() {
    return function (this: any, opt: string | Zod2xMetadata) {
        return new (this as any).constructor({
            ...this._def,
            zod2x: typeof opt === "string" ? { typeName: opt } : opt,
        });
    };
}

export function extendZod(zod: typeof z) {
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
            opt: ZodNativeEnum | ZodEnum<any> | Pick<Zod2xMetadata, "parentEnum">
        ) {
            return new (this as any).constructor({
                ...this._def,
                zod2x:
                    opt instanceof zod.ZodEnum || opt instanceof zod.ZodNativeEnum
                        ? { parentEnum: opt }
                        : opt,
            });
        };
    }
}
