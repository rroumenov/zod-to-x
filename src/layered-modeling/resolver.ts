import { IZod2xLayerMetadata, IZod2xMetadata } from "@/lib/zod_ext";
import {
    getCopySource,
    getOwnZod2xMetadata,
    getZod2xMetadata,
    linkCopies,
    resolveZod2xMetadata,
    setLayeredMetadataLookup,
    Zod2xMetadataLookup,
} from "@/lib/zod2x_metadata";
import { ZodHelpers, ZodType } from "@/lib/zod_helpers";

/**
 * Layered modeling is resolved when models are transpiled, from the types declared by all the
 * created models. Layer decorators only declare the types of their model: schemas are not
 * modified and no metadata is stored for them.
 *
 * Each model property that declares a type is replaced by a copy of its schema (its handle), so
 * a schema used through a model property (`price = otherModel.money`) is told apart from the same
 * schema used directly (`price = Money`).
 */

/**
 * A type declared by a model property.
 */
export interface ILayerDeclaration {
    model: object;
    prop: string;

    /**
     * Type name derived from the property name.
     */
    name: string;
    layer: IZod2xLayerMetadata;

    /**
     * Schema assigned to the property.
     */
    value: ZodType;

    /**
     * Copy of the schema that replaces it as property value.
     */
    handle: ZodType;

    /**
     * Declaration order, among all models.
     */
    sequence: number;
}

/**
 * Models created with a layer decorator.
 */
const layeredModels = new Set<object>();

const declarations: ILayerDeclaration[] = [];
const declarationsByHandle = new WeakMap<object, ILayerDeclaration>();

/**
 * Incremented when a layered model is created. The layered information of the types depends on
 * all created models, so everything computed with a previous generation is computed again.
 */
let layeredGeneration = 0;

export function getLayeredModels(): ReadonlySet<object> {
    return layeredModels;
}

export function getLayeredGeneration(): number {
    return layeredGeneration;
}

/**
 * Declares the type of a model property. Returns the handle that replaces the property value.
 */
export function declareLayerType(
    model: object,
    prop: string,
    name: string,
    layer: IZod2xLayerMetadata,
    value: ZodType
): ZodType {
    const handle = ZodHelpers.cloneZod(value);
    const declaration: ILayerDeclaration = {
        model,
        prop,
        name,
        layer,
        value,
        handle,
        sequence: declarations.length,
    };

    declarations.push(declaration);
    declarationsByHandle.set(handle, declaration);

    // Copies with another unknown keys policy (`.strict()`, ...) are the same type.
    linkCopies(value);
    linkCopies(handle);

    return handle;
}

/**
 * Registers a model once all its types are declared.
 */
export function registerLayeredModel(model: object) {
    layeredModels.add(model);
    layeredGeneration++;
}

/**
 * How a declaration defines its type.
 * - `type`: the property declares a schema (`underlying`), directly or through the property of
 *   another model that declares it (`throughModel`). Its owner is the lowest layer declaring it.
 * - `generic`: the property declares an instance of a generic type (`useGenericType`).
 * - `derived`: the property uses a type derived by another model (a layer alias or an instance of
 *   a generic type), which it extends.
 */
type TDeclarationKind =
    | { kind: "type"; underlying: ZodType; throughModel: boolean; source?: ILayerDeclaration }
    | { kind: "generic" }
    | { kind: "derived" };

/**
 * Layered information of the types declared by the created models.
 */
interface ILayerResolution {
    lookup: Zod2xMetadataLookup;

    /**
     * Layer files that declare the type of a declaration without referencing one another.
     */
    ties: Map<ILayerDeclaration, string[]>;
}

/**
 * Layered metadata of a schema: the metadata of a declared type or of a layer alias, or the same
 * metadata as another schema (handles of properties that do not define their own type).
 */
type TLayeredMetadata = { metadata: IZod2xMetadata } | { sameAs: ZodType };

let resolution: { generation: number; value: ILayerResolution } | undefined;

/**
 * Returns the declaration of the model property a schema comes from, if any.
 */
function findDeclaration(schema: ZodType): ILayerDeclaration | undefined {
    let current: unknown = schema;

    while (current !== undefined && current !== null) {
        const declaration = declarationsByHandle.get(current as object);
        if (declaration !== undefined) {
            return declaration;
        }
        current = getCopySource(current);
    }

    return undefined;
}

function resolveDeclarations(): ILayerResolution {
    const layered = new Map<unknown, TLayeredMetadata>();
    const ties = new Map<ILayerDeclaration, string[]>();

    // Metadata of a schema: from the declared types, or the metadata set on it.
    const lookup: Zod2xMetadataLookup = (schema) => {
        let current: unknown = schema;

        while (current !== undefined && current !== null && typeof current === "object") {
            const entry = layered.get(current);
            if (entry !== undefined) {
                return "metadata" in entry ? entry.metadata : lookup(entry.sameAs);
            }

            const own = getOwnZod2xMetadata(current);
            if (own !== undefined) {
                return own;
            }

            current = getCopySource(current);
        }

        return undefined;
    };

    // A declaration that does not define its own type extends the type it uses, if it belongs to
    // another file or has another name. Otherwise, the property is the same type.
    const setHandleMetadata = (declaration: ILayerDeclaration, extended: ZodType) => {
        const base = resolveZod2xMetadata(extended, lookup);

        layered.set(
            declaration.handle,
            declaration.layer.externalInheritance !== false &&
                (base?.layer?.file !== declaration.layer.file ||
                    declaration.name !== base?.typeName)
                ? {
                      metadata: {
                          typeName: declaration.name,
                          layer: declaration.layer,
                          aliasOf: extended,
                      },
                  }
                : { sameAs: extended }
        );
    };

    // Kind of each declaration. A declaration only uses properties of models created before.
    // Declarations through the property of a model that declares a type are resolved below, once
    // the owners of the types are known.
    const kinds = new Map<ILayerDeclaration, TDeclarationKind>();
    for (const declaration of declarations) {
        const source = findDeclaration(declaration.value);
        const sourceKind = source === undefined ? undefined : kinds.get(source);

        if (sourceKind?.kind === "type") {
            kinds.set(declaration, {
                kind: "type",
                underlying: sourceKind.underlying,
                throughModel: true,
                source,
            });
        } else if (source !== undefined) {
            kinds.set(declaration, { kind: "derived" });
        } else if (getZod2xMetadata(declaration.value)?.genericOf !== undefined) {
            kinds.set(declaration, { kind: "generic" });
        } else {
            kinds.set(declaration, {
                kind: "type",
                underlying: declaration.value,
                throughModel: false,
            });
        }
    }

    // A schema copied by Zod from a declared schema (e.g. with `.describe()`) is the same type.
    const declaredSchemas = new Set<ZodType>();
    kinds.forEach((kind) => kind.kind === "type" && declaredSchemas.add(kind.underlying));
    kinds.forEach((kind) => {
        if (kind.kind === "type" && !kind.throughModel) {
            let current: unknown = getCopySource(kind.underlying);
            while (current !== undefined && current !== null) {
                if (declaredSchemas.has(current as ZodType)) {
                    kind.underlying = current as ZodType;
                    break;
                }
                current = getCopySource(current);
            }
        }
    });

    // Declarations of each schema. The type belongs to the lowest layer that declares it, and to
    // the first declaration among the declarations of that layer.
    const byPriority = (a: ILayerDeclaration, b: ILayerDeclaration) =>
        a.layer.index - b.layer.index || a.sequence - b.sequence;

    // Owners among the declarations that use the schemas directly.
    const directOwners = new Map<ZodType, ILayerDeclaration>();
    for (const declaration of [...declarations].sort(byPriority)) {
        const kind = kinds.get(declaration)!;
        if (kind.kind === "type" && !kind.throughModel && !directOwners.has(kind.underlying)) {
            directOwners.set(kind.underlying, declaration);
        }
    }

    // A declaration through the property of the owner declares the same type. A declaration
    // through the property of another declaration (a layer alias) extends that alias.
    for (const declaration of declarations) {
        const kind = kinds.get(declaration)!;
        if (kind.kind === "type" && kind.source !== undefined) {
            const sourceKind = kinds.get(kind.source)!;
            if (
                sourceKind.kind === "type" &&
                directOwners.get(sourceKind.underlying) === kind.source
            ) {
                kind.underlying = sourceKind.underlying;
            } else {
                kinds.set(declaration, { kind: "derived" });
            }
        }
    }

    const declarationsOfType = new Map<ZodType, ILayerDeclaration[]>();
    for (const declaration of declarations) {
        const kind = kinds.get(declaration)!;
        if (kind.kind === "type") {
            const list = declarationsOfType.get(kind.underlying) ?? [];
            list.push(declaration);
            declarationsOfType.set(kind.underlying, list);
        }
    }

    const owners = new Map<ZodType, ILayerDeclaration>();
    declarationsOfType.forEach((list, schema) => {
        const owner = [...list].sort(byPriority)[0];
        owners.set(schema, owner);
        const own = getZod2xMetadata(schema);

        // A type name set with zod2x is kept.
        layered.set(schema, {
            metadata: { ...own, typeName: own?.typeName || owner.name, layer: owner.layer },
        });

        const tie = new Set<string>();
        for (const declaration of list) {
            const kind = kinds.get(declaration) as { throughModel: boolean };
            if (
                declaration.layer.index === owner.layer.index &&
                declaration.layer.file !== owner.layer.file &&
                !kind.throughModel
            ) {
                // Declared by models of the same layer without referencing one another, so the
                // file that defines it would depend on the order in which models are created.
                tie.add(owner.layer.file);
                tie.add(declaration.layer.file);
            }
        }
        if (tie.size > 0) {
            list.forEach((declaration) => ties.set(declaration, [...tie].sort()));
        }
    });

    // Handles, in declaration order: derived types only extend types declared before.
    for (const declaration of declarations) {
        const kind = kinds.get(declaration)!;

        if (kind.kind === "type") {
            if (owners.get(kind.underlying) === declaration) {
                layered.set(declaration.handle, { sameAs: kind.underlying });
            } else {
                setHandleMetadata(declaration, kind.underlying);
            }
        } else if (kind.kind === "generic") {
            const generic = declaration.value;
            const base = resolveZod2xMetadata(generic, lookup);

            if (base?.layer === undefined && !layered.has(generic)) {
                // Instance of a generic type that does not belong to any layer.
                layered.set(generic, {
                    metadata: {
                        ...getZod2xMetadata(generic),
                        layer: declaration.layer,
                        ...(base?.typeName ? {} : { typeName: declaration.name }),
                    },
                });
            }

            setHandleMetadata(declaration, generic);
        } else {
            setHandleMetadata(declaration, declaration.value);
        }
    }

    return { lookup, ties };
}

function getResolution(): ILayerResolution {
    if (resolution?.generation !== layeredGeneration) {
        resolution = { generation: layeredGeneration, value: resolveDeclarations() };
    }

    return resolution.value;
}

/**
 * Returns the layer files that declare the type of a model property without referencing one
 * another, if any.
 */
export function getOwnershipTie(handle: ZodType): string[] | undefined {
    const declaration = declarationsByHandle.get(handle);
    return declaration === undefined ? undefined : getResolution().ties.get(declaration);
}

// Layered metadata is resolved from the declared types when schemas are resolved.
setLayeredMetadataLookup((schema) =>
    declarations.length > 0 ? getResolution().lookup(schema) : getZod2xMetadata(schema)
);
