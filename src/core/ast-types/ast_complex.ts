import { ASTCommon, ASTTemplateTranslation, ASTType } from "./ast_common";

/**
 * Handle ZodEnum and ZodNativeEnum
 */
export class ASTEnum extends ASTCommon {
    static readonly kind = "ASTEnum";

    name: string;
    values: [string, string | number][];

    /**
     * The enum is injected using zod2x method during ZodDiscriminatedUnion creation.
     */
    isFromDiscriminatedUnion?: boolean;

    constructor(data: ASTEnum & ASTCommon) {
        super(data);

        this.name = data.name;
        this.values = data.values;
        this.isFromDiscriminatedUnion = data.isFromDiscriminatedUnion;
    }
}

/**
 * Handle ZodObject
 */
export class ASTObject extends ASTCommon {
    static readonly kind = "ASTObject";

    name: string;
    properties: Record<string, ASTType>;
    templates: Set<string>; // In case of generic template definition. Ex: "T", "K", "Data", ...

    // In case of model definition that uses a generic template. Shall follow the same order as
    // templates definition.
    templatesTranslation: ASTTemplateTranslation[];

    // In case of generic type instance, the name of the generic type.
    genericOf?: string;

    constructor(data: ASTObject & ASTCommon) {
        super(data);

        this.name = data.name;
        this.properties = data.properties;
        this.templates = data.templates;
        this.templatesTranslation = data.templatesTranslation;
        this.genericOf = data.genericOf;
    }
}

/**
 * Handle ZodUnion and ZodDiscriminatedUnion
 */
export class ASTUnion extends ASTCommon {
    static readonly kind = "ASTUnion";

    name: string;
    options: ASTType[];
    areAllObjects: boolean;
    discriminantKey?: string;

    /**
     * Allows to create a new object with the union properties. Used in languages that do not
     * have a variant type or discriminated union cannot be used.
     */
    newObject?: ASTObject;

    constructor(data: ASTUnion & ASTCommon) {
        super(data);

        this.name = data.name;
        this.options = data.options;
        this.areAllObjects = data.areAllObjects;
        this.discriminantKey = data.discriminantKey;
        this.newObject = data.newObject;
    }
}

/**
 * Handle ZodIntersection
 */
export class ASTIntersection extends ASTCommon {
    static readonly kind = "ASTIntersection";

    name: string;
    left: ASTType;
    right: ASTType;
    areAllObjects: boolean;

    /**
     * Allows to create a new object with the union properties. Used in languages that do not
     * support multiple inheritance.
     */
    newObject?: ASTObject;

    constructor(data: ASTIntersection & ASTCommon) {
        super(data);

        this.name = data.name;
        this.left = data.left;
        this.right = data.right;
        this.areAllObjects = data.areAllObjects;
        this.newObject = data.newObject;
    }
}

/**
 * Handle ZodRecord and ZodMap
 */
export class ASTMap extends ASTCommon {
    static readonly kind = "ASTMap";

    name?: string; // Only exists for type aliases.
    key: ASTType;
    value: ASTType;
    type: "record" | "map";

    constructor(data: ASTMap & ASTCommon) {
        super(data);

        this.name = data.name;
        this.key = data.key;
        this.value = data.value;
        this.type = data.type;
    }
}

/**
 * Handle ZodSet
 */
export class ASTSet extends ASTCommon {
    static readonly kind = "ASTSet";

    name?: string; // Only exists for type aliases.
    value: ASTType;

    constructor(data: ASTSet & ASTCommon) {
        super(data);

        this.name = data.name;
        this.value = data.value;
    }
}

/**
 * Handle ZodTuple
 */
export class ASTTuple extends ASTCommon {
    static readonly kind = "ASTTuple";

    name?: string; // Only exists for type aliases.
    items: ASTType[];

    constructor(data: ASTTuple & ASTCommon) {
        super(data);

        this.name = data.name;
        this.items = data.items;
    }
}

/**
 * Handle ZodArray. Only used for type aliases.
 */
export class ASTArray extends ASTCommon {
    static readonly kind = "ASTArray";

    name: string;
    item: ASTType;

    constructor(data: ASTArray & ASTCommon) {
        super(data);

        this.name = data.name;
        this.item = data.item;
    }
}
