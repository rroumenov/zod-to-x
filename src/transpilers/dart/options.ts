import { IZodToXOpt } from "@/core";

export interface IZod2DartOpt extends IZodToXOpt {
    /**
     * By default (false), class property names are converted to camelCase following Dart
     * conventions. If set to true, the original property names are preserved as-is.
     */
    keepKeys?: boolean;

    /**
     * When true (default), emits `@JsonSerializable()` annotations, `@JsonEnum`, `@JsonKey`,
     * and `fromJson`/`toJson` delegation stubs. Requires `package:json_annotation`.
     * The `.g.dart` part file is generated externally by `dart run build_runner build`.
     */
    useJsonSerialization?: boolean;

    /**
     * Filename (without extension) used for the `part '${partFile}.g.dart';` directive.
     * When using layered modeling, this is automatically set to the layer's `file` metadata.
     * If omitted, no `part` directive is emitted.
     */
    partFile?: string;
}

export const defaultOpts: IZod2DartOpt = {
    indent: 2,
    includeComments: true,
    useImports: true,

    keepKeys: false,
    useJsonSerialization: true,
};
