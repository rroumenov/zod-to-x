import { IZodToXOpt } from "@/core";

export interface IZod2ProtoV3Opt extends Omit<IZodToXOpt, "skipDiscriminatorNodes"> {
    /**
     * Name of the protobuf file package.
     */
    packageName?: string;

    /**
     * Protobuf follows the snake_case convention for field names, but camelCase can also be used.
     */
    useCamelCase?: boolean;
}

export const defaultOpts: IZod2ProtoV3Opt = {
    includeComments: true,
    indent: 4,
    useCamelCase: false,

    skipDiscriminatorNodes: true, // Not required for protobuf files
    useImports: false, // Not required for protobuf files
};
