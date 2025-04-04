import { ZodFirstPartyTypeKind } from "zod";

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
