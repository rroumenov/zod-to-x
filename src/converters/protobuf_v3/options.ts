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

    /**
     * If true, double values will be represented as integers in the generated protobuf file.
     * This could be useful when integer representation could be done with int32 or smaller because
     * output will be more compact. Default is false.
     */
    encodeDoubleAsInt?: boolean;
}

export const defaultOpts: IZod2ProtoV3Opt = {
    includeComments: true,
    indent: 4,
    keepKeys: false,
    encodeDoubleAsInt: false,

    useImports: false, // Not required for protobuf files
};
