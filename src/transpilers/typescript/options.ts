import { IZodToXOpt } from "@/core";

export interface IZod2TsOpt extends IZodToXOpt {
    /**
     * Output transpilation using Typescript interfaces or Classes.
     */
    outType?: "interface" | "class";

    /**
     * By default (false), structure/class property names are converted according to the target
     * language's naming conventions. If set to true, the original property names are preserved.
     */
    keepKeys?: boolean;
}

export const defaultOpts: IZod2TsOpt = {
    includeComments: true,
    indent: 4,
    useImports: true,

    outType: "interface",
    keepKeys: false,
};
