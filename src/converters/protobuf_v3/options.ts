import { IZodToXOpt } from "@/core";

export interface IZod2ProtoV3Opt extends IZodToXOpt {
    /**
     * Name of the protobuf file package.
     */
    packageName?: string;

    /**
     * By default (false), structure/class property names are converted according to the target
     * language's naming conventions. If set to true, the original property names are preserved.
     */
    keepKeys?: boolean;
}

export const defaultOpts: IZod2ProtoV3Opt = {
    includeComments: true,
    indent: 4,
    keepKeys: false,

    useImports: false, // Not required for protobuf files
};
