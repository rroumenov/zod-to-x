import { ASTNodes, BadLayerDefinitionError, IZod2AstOpt, Zod2Ast } from "@/core";
import { IZod2xLayerMetadata } from "@/lib/zod_ext";
import { ZodHelpers } from "@/lib/zod_helpers";
import * as Transpilers from "@/transpilers";

type TargetKeys = keyof typeof Transpilers;
type Target<T extends TargetKeys> = (typeof Transpilers)[T];
type TargetOpt<K extends TargetKeys> = ConstructorParameters<Target<K>>[0];
type AstOpt = Pick<IZod2AstOpt, "strict">;

/**
 * Class that provides the foundational structure for defining layered models, managing metadata,
 * and exposing transpile method for all supported languages.
 * It is intended to be extended by specific model implementations.
 *
 * @remarks
 * - Children classes require the `@Domain` or other layer decorators to define the layer metadata.
 * - It automatically collects properties of the model that are instances of `ZodType` and processes
 *   them into AST nodes.
 *
 * @example
 * ```typescript
 * @Domain({ name: 'User', file: 'user.ts' })
 * class UserModel extends Zod2XModel {
 *   username = z.string();
 *   age = z.number();
 * }
 *
 * const userModel = new UserModel({ modelName: 'User' });
 * const userModelTypescript = userModel.transpile(Transpilers.Zod2Ts);
 * ```
 */
export class Zod2XModel {
    private astNodes: ASTNodes | null = null;

    private getModelName(): string {
        const modelName: string = (this as any)["modelName"];
        if (!modelName) {
            throw new BadLayerDefinitionError(
                "Model name is not defined." +
                    "Did you forget to add the @Domain or other layer decorator?"
            );
        }
        return modelName;
    }

    private getLayerMetadata(): IZod2xLayerMetadata {
        const layerMetadata: IZod2xLayerMetadata = (this as any)["layerMetadata"];
        if (!layerMetadata) {
            throw new BadLayerDefinitionError(
                "Layer metadata is not defined." +
                    "Did you forget to add the @Domain or other layer decorator?"
            );
        }
        return layerMetadata;
    }

    private getAstNode(opt: AstOpt = {}): ASTNodes {
        if (this.astNodes) {
            return this.astNodes;
        }

        const objectProps = new Map<string, any>();

        Object.getOwnPropertyNames(this).forEach((prop) => {
            if (ZodHelpers.isZodType((this as any)[prop])) {
                objectProps.set(prop, (this as any)[prop]);
            }
        });

        this.astNodes = new Zod2Ast({ ...opt, layer: this.getLayerMetadata() }).build(
            ZodHelpers.createZodObject(objectProps).zod2x(this.getModelName())
        );

        return this.astNodes;
    }

    /**
     * Transpiles the model into a target language using the specified transpiler.
     *
     * @param target - The constructor of the target transpiler.
     * @param opt - The options required to initialize the target transpiler.
     * @param astOpt - Options for the AST generation.
     *
     * @returns A string representing the transpiled model in the target language.
     */
    public transpile(
        target: Target<"Zod2Cpp">,
        opt?: TargetOpt<"Zod2Cpp">,
        astOpt?: AstOpt
    ): string;
    public transpile(
        target: Target<"Zod2Cpp17">,
        opt?: TargetOpt<"Zod2Cpp17">,
        astOpt?: AstOpt
    ): string;
    public transpile(target: Target<"Zod2Ts">, opt?: TargetOpt<"Zod2Ts">, astOpt?: AstOpt): string;

    public transpile(
        target: Target<TargetKeys>,
        opt: TargetOpt<TargetKeys> = {},
        astOpt?: AstOpt
    ): string {
        const transpilerInstance = new target({
            ...opt,
            namespace: this.getLayerMetadata().namespace,
        } as any);
        return transpilerInstance.transpile(this.getAstNode(astOpt));
    }
}
