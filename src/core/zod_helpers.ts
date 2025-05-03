import {
    ZodDiscriminatedUnion,
    ZodEnum,
    ZodFirstPartyTypeKind,
    ZodIntersection,
    ZodNativeEnum,
    ZodObject,
    ZodTypeAny,
    ZodUnion,
} from "zod";

export function isTranspilerableZodType(zodType: string): boolean {
    return (
        zodType === ZodFirstPartyTypeKind.ZodEnum ||
        zodType === ZodFirstPartyTypeKind.ZodNativeEnum ||
        zodType === ZodFirstPartyTypeKind.ZodObject ||
        zodType === ZodFirstPartyTypeKind.ZodUnion ||
        zodType === ZodFirstPartyTypeKind.ZodDiscriminatedUnion ||
        zodType === ZodFirstPartyTypeKind.ZodIntersection
    );
}

export function cloneTranspiledExtendable(zodItem: ZodTypeAny) {
    if (zodItem instanceof ZodObject) {
        return new ZodObject({ ...zodItem._def });
    } else if (zodItem instanceof ZodUnion) {
        return new ZodUnion({ ...zodItem._def });
    } else if (zodItem instanceof ZodDiscriminatedUnion) {
        return new ZodDiscriminatedUnion({ ...zodItem._def });
    } else if (zodItem instanceof ZodIntersection) {
        return new ZodIntersection({ ...zodItem._def });
    } else if (zodItem instanceof ZodEnum) {
        return new ZodEnum({ ...zodItem._def });
    } else if (zodItem instanceof ZodNativeEnum) {
        return new ZodNativeEnum({ ...zodItem._def });
    } else {
        throw new Error(`This type cannot be extended when transpiled: ${zodItem}`);
    }
}
