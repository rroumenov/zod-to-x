import { IZodToXOpt } from "@/core";

export interface IZod2CppOpt extends IZodToXOpt {
    /**
     * When serializing, include all values even if null. Default is false.
     */
    includeNulls?: boolean;

    /**
     * Define namespace name which contains the output code.
     *
     * @remarks
     * - If layered modeling is used, its value its overriden by the layer namespace provided from
     *   the decorator.
     */
    namespace?: string;

    /**
     * Output transpilation using C++ Structs or Classes.
     */
    outType?: "struct" | "class";

    /**
     * Remove Nlohmann JSON serialization/deserialization. Default is false.
     */
    skipSerialize?: boolean;

    /**
     * By default (false), structure/class property names are converted according to the target
     * language's naming conventions. If set to true, the original property names are preserved.
     */
    keepKeys?: boolean;
}

export const defaultOpts: IZod2CppOpt = {
    includeComments: true,
    indent: 4,
    useImports: true,

    namespace: "zodtocpp",
    outType: "struct",
    includeNulls: false,
    keepKeys: false,
};
