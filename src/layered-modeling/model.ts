import { ASTNodes, BadLayerDefinitionError, IZod2AstOpt, Zod2Ast } from "@/core";
import { IZod2xLayerMetadata } from "@/lib/zod_ext";
import { getZod2xMetadata, resolveZod2xMetadata } from "@/lib/zod2x_metadata";
import { ZodHelpers, ZodType } from "@/lib/zod_helpers";
import * as Transpilers from "@/transpilers";
import { log } from "@/utils/logger";

import { getLayeredGeneration, getLayeredModels, getOwnershipTie } from "./layer";

type TargetKeys = keyof typeof Transpilers;
type Target<T extends TargetKeys> = (typeof Transpilers)[T];
type TargetOpt<K extends TargetKeys> = ConstructorParameters<Target<K>>[0];
type AstOpt = Pick<IZod2AstOpt, "strict">;

/**
 * Returns the files, other than its own file, of the types used by an AST.
 */
/**
 * Files imported by each AST, as ASTs are not modified once built.
 */
const importedFilesCache = new WeakMap<ASTNodes, Set<string>>();

function getImportedFiles(astNodes: ASTNodes, ownFile: string): Set<string> {
    const cached = importedFilesCache.get(astNodes);
    if (cached !== undefined) {
        return cached;
    }

    const files = new Set<string>();
    const visited = new Set<object>();

    const visit = (value: unknown) => {
        if (typeof value !== "object" || value === null || visited.has(value)) {
            return;
        }
        visited.add(value);

        if ("_zod" in value) {
            return; // Zod schemas referenced by AST nodes are not part of the AST.
        }

        const parentFile = (value as { parentFile?: unknown }).parentFile;
        if (typeof parentFile === "string" && parentFile !== ownFile) {
            files.add(parentFile);
        }

        const children =
            value instanceof Map || value instanceof Set ? value.values() : Object.values(value);
        for (const child of children) {
            visit(child);
        }
    };

    visit(astNodes.nodes);
    importedFilesCache.set(astNodes, files);
    return files;
}

/**
 * Returns a circular import path that starts and ends in a file, if any.
 */
function findImportCycle(imports: Map<string, Set<string>>, file: string): string[] | undefined {
    const visited = new Set<string>([file]);
    const pending: string[][] = [[file]];

    while (pending.length > 0) {
        const path = pending.shift()!;

        for (const next of imports.get(path[path.length - 1]) ?? []) {
            if (next === file) {
                return [...path, file];
            }
            if (!visited.has(next)) {
                visited.add(next);
                pending.push([...path, next]);
            }
        }
    }

    return undefined;
}

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
    private astNodes = new Map<string, ASTNodes>();
    private astNodesGeneration = -1;

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

    /**
     * Reports an issue of the layered model: an error in strict mode, a warning otherwise.
     */
    private reportLayerIssue(message: string, opt: AstOpt, astNodes?: ASTNodes) {
        if (opt.strict !== false) {
            throw new BadLayerDefinitionError(message);
        }

        log.warn(message);
        astNodes?.warnings.push(message);
    }

    /**
     * Returns the issues of types declared by this model and by a model of the same layer in
     * another file, without one of them referencing the other.
     */
    private getOwnershipTieIssues(objectProps: Map<string, ZodType>): string[] {
        const issues = new Set<string>();

        objectProps.forEach((schema) => {
            // Layer aliases are checked through the type they extend.
            for (const item of [schema, getZod2xMetadata(schema)?.aliasOf]) {
                const files = item === undefined ? undefined : getOwnershipTie(item);

                if (files !== undefined) {
                    issues.add(
                        `Type '${resolveZod2xMetadata(item)?.typeName}' is declared by models of ` +
                            `the same layer in different files (${files.join(", ")}) without ` +
                            `one referencing the other, so the file that defines it depends on ` +
                            `the order in which the models are created. Declare it in one model ` +
                            `and use it in the other through that model (e.g. ` +
                            `\`address = otherModel.address\`).`
                    );
                }
            }
        });

        return [...issues];
    }

    private getAstNode(opt: AstOpt = {}): ASTNodes {
        // Layered information depends on all created models, so ASTs built before a model was
        // created (or a type moved to another layer) are built again.
        const generation = getLayeredGeneration();
        if (generation !== this.astNodesGeneration) {
            this.astNodes.clear();
            this.astNodesGeneration = generation;
        }

        const cacheKey = JSON.stringify({ strict: opt.strict ?? true });
        const cached = this.astNodes.get(cacheKey);
        if (cached) {
            return cached;
        }

        const objectProps = new Map<string, any>();

        Object.getOwnPropertyNames(this).forEach((prop) => {
            if (ZodHelpers.isZodType((this as any)[prop])) {
                objectProps.set(prop, (this as any)[prop]);
            }
        });

        const tieIssues = this.getOwnershipTieIssues(objectProps);
        if (tieIssues.length > 0 && opt.strict !== false) {
            this.reportLayerIssue(tieIssues.join("\n"), opt);
        }

        const astNodes = new Zod2Ast({ ...opt, layer: this.getLayerMetadata() }).build(
            ZodHelpers.createZodObject(objectProps).zod2x(this.getModelName())
        );
        tieIssues.forEach((issue) => this.reportLayerIssue(issue, opt, astNodes));
        this.astNodes.set(cacheKey, astNodes);

        return astNodes;
    }

    /**
     * Returns an AST of the model to know the files it imports: any AST built for the current
     * generation (strict mode does not change the imported files), or a non-strict one.
     */
    private getImportsAstNode(): ASTNodes {
        if (this.astNodesGeneration === getLayeredGeneration() && this.astNodes.size > 0) {
            return this.astNodes.values().next().value!;
        }

        return this.getAstNode({ strict: false });
    }

    /**
     * Checks that the file of this model does not import itself back through the files of other
     * layered models, for transpilers that do not support circular imports.
     */
    private checkCircularImports(astNodes: ASTNodes, opt: AstOpt) {
        const file = this.getLayerMetadata().file;
        const imports = new Map<string, Set<string>>();

        getLayeredModels().forEach((model) => {
            if (!(model instanceof Zod2XModel)) {
                return;
            }

            let modelAstNodes: ASTNodes = astNodes;
            if (model !== this) {
                try {
                    modelAstNodes = model.getImportsAstNode();
                } catch {
                    return; // Errors of other models are reported when they are transpiled.
                }
            }

            const modelFile = model.getLayerMetadata().file;
            const modelImports = imports.get(modelFile) ?? new Set<string>();
            getImportedFiles(modelAstNodes, modelFile).forEach((i) => modelImports.add(i));
            imports.set(modelFile, modelImports);
        });

        const cycle = findImportCycle(imports, file);
        if (cycle !== undefined) {
            this.reportLayerIssue(
                `Circular import between layer files: ${cycle.join(" -> ")}. The output of the ` +
                    `target language cannot import files circularly. Move the types used by ` +
                    `both files to one of them, or to a lower layer.`,
                opt
            );
        }
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
    public transpile(target: Target<"Zod2Py">, opt?: TargetOpt<"Zod2Py">, astOpt?: AstOpt): string;
    public transpile(target: Target<"Zod2Go">, opt?: TargetOpt<"Zod2Go">, astOpt?: AstOpt): string;
    public transpile(
        target: Target<"Zod2Dart">,
        opt?: TargetOpt<"Zod2Dart">,
        astOpt?: AstOpt
    ): string;

    public transpile(
        target: Target<TargetKeys>,
        opt: TargetOpt<TargetKeys> = {},
        astOpt?: AstOpt
    ): string {
        const transpilerInstance = new target({
            ...opt,
            namespace: this.getLayerMetadata().namespace,
            partFile: this.getLayerMetadata().file,
        } as any);
        const astNodes = this.getAstNode(astOpt);

        if (!transpilerInstance.supportsCircularImports()) {
            this.checkCircularImports(astNodes, astOpt ?? {});
        }

        return transpilerInstance.transpile(astNodes);
    }
}
