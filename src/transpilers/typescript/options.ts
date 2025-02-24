import { IZodToXOpt } from "@/core";

export interface IZod2TsOpt extends IZodToXOpt {
    /**
     * Output transpilation using Typescript interfaces or Classes.
     */
    outType?: "interface" | "class";
}

export const defaultOpts: IZod2TsOpt = {
    includeComments: true,
    indent: 4,
    skipDiscriminatorNodes: false,

    outType: "interface",
};
