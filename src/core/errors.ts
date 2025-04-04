/**
 * Raised when 'zod2x' has not been used to set a type name for a transpilerable schema.
 */
export class AstTypeNameDefinitionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "TypeNameDefinitionError";
    }
}

export class AstNodeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AstNodeError";
    }
}

export class NotTranspilerableTypeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NotTranspilerableTypeError";
    }
}

export class BadLayerDefinitionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "BadLayerDefinitionError";
    }
}
