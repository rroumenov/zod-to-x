import { ASTCommon, ASTDefintion } from "./ast_common";

/**
 * Handle ZodString
 */
export class ASTString extends ASTCommon {
    name?: string; // Only exists for type aliases.
    constraints?: {
        min?: number;
        max?: number;
        regex?: RegExp;
    };

    constructor(data: ASTString & ASTCommon) {
        super(data);

        this.name = data.name;
        this.constraints = data.constraints;
    }
}

/**
 * Handle ZodNumber and ZodBigInt
 */
export class ASTNumber extends ASTCommon {
    name?: string; // Only exists for type aliases.
    constraints?: {
        min?: number;
        max?: number;
        isInt?: boolean;
    };

    constructor(data: ASTNumber & ASTCommon) {
        super(data);

        this.name = data.name;
        this.constraints = data.constraints;
    }
}

/**
 * Handle ZodLiteral
 */
export class ASTLiteral extends ASTCommon {
    name?: string; // Only exists for type aliases.
    value: any;
    parentEnum?: ASTDefintion;
    parentEnumKey?: string;

    constructor(data: ASTLiteral & ASTCommon) {
        super(data);

        this.name = data.name;
        this.value = data.value;
        this.parentEnum = data.parentEnum;
        this.parentEnumKey = data.parentEnumKey;
    }
}

/**
 * Handle ZodBoolean
 */
export class ASTBoolean extends ASTCommon {
    name?: string; // Only exists for type aliases.

    constructor(data: ASTBoolean & ASTCommon) {
        super(data);

        this.name = data.name;
    }
}

/**
 * Handle ZodDate
 */
export class ASTDate extends ASTCommon {
    name?: string; // Only exists for type aliases.

    constructor(data: ASTDate & ASTCommon) {
        super(data);

        this.name = data.name;
    }
}

/**
 * Handle ZodAny
 */
export class ASTAny extends ASTCommon {
    name?: string; // Only exists for type aliases.

    constructor(data: ASTAny & ASTCommon) {
        super(data);

        this.name = data.name;
    }
}
