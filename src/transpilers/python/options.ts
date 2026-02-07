import { IZodToXOpt } from "@/core";

export interface IZod2PyOpt extends Omit<IZodToXOpt, "indent"> {
    /**
     * By default (false), structure/class property names are converted according to the target
     * language's naming conventions. If set to true, the original property names are preserved.
     */
    keepKeys?: boolean;
}

export const defaultOpts: IZod2PyOpt = {
    includeComments: true,
    useImports: true,

    keepKeys: false,
};
