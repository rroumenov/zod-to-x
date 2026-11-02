import { ASTCommon, ASTDefinition } from "./ast_common";

/**
 * Handle ZodString
 */
export class ASTString extends ASTCommon {
    static readonly kind = "ASTString";

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
    static readonly kind = "ASTNumber";

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
    static readonly kind = "ASTLiteral";

    name?: string; // Only exists for type aliases.
    value: string | number | boolean;
    parentEnum?: ASTDefinition;
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
    static readonly kind = "ASTBoolean";

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
    static readonly kind = "ASTDate";

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
    static readonly kind = "ASTAny";

    name?: string; // Only exists for type aliases.

    constructor(data: ASTAny & ASTCommon) {
        super(data);

        this.name = data.name;
    }
}
