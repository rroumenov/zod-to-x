import { IZodToXOpt } from "@/core";

export interface IZod2CppOpt extends IZodToXOpt {
    /**
     * When serializing, include all values even if null. Default is false.
     */
    includeNulls?: boolean;

    /**
     * Define namespace name which contains the output code.
     */
    namespace?: string;
    
    /**
     * Output transpilation using C++ Structs or Classes.
     */
    outType?: 'struct' | 'class';

    /**
     * Remove Nlohmann JSON serialization/deserialization. Default is false.
     */
    skipSerialize?: boolean;
}

export const defaultOpts: IZod2CppOpt = {
    includeComments: true,
    indent: 4,
    skipDiscriminatorNodes: false,
    
    namespace: "zodtocpp",
    outType: 'struct',
    includeNulls: false,
}