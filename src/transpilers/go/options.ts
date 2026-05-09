import { IZodToXOpt } from "@/core";

export interface IZod2GoOpt extends IZodToXOpt {
    /**
     * The Go package name for the generated file. Default: "models"
     */
    packageName?: string;

    /**
     * By default (false), struct field names are exported (PascalCase) and JSON tags use the
     * original property name. If set to true, original property names are preserved as-is.
     */
    keepKeys?: boolean;

    /**
     * Whether to emit `json:"fieldName"` struct tags. Default: true
     */
    useJsonTags?: boolean;
}

export const defaultOpts: IZod2GoOpt = {
    includeComments: true,
    indent: 4,
    useImports: true,

    packageName: "models",
    keepKeys: false,
    useJsonTags: true,
};
