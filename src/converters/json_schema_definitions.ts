import { ZodHelpers, ZodType } from "@/lib/zod_helpers";

/**
 * Recursively extracts custom type definitions from a Zod schema and collects them into a
 * definitions object.
 *
 * This function traverses the provided Zod schema and its nested schemas to collect all schemas
 * that have a custom `typeName` defined in `schema._zod2x.typeName`. It accumulates these
 * schemas into a `definitions` object, which maps each `typeName` to its corresponding schema.
 * This is useful for generating JSON Schema definitions or for any scenario where you need to
 * collect and reference custom types.
 *
 * @param schema - The root Zod schema from which to extract definitions.
 * @param definitions - (Optional) An object to accumulate the definitions.
 *                      Used across recursive calls.
 * @param visited - (Optional) A Set to keep track of visited schemas and prevent infinite recursion
 *                  in cases of circular references. Used across recursive calls.
 * @returns An object containing all extracted definitions, where each key is a `typeName` and the
 *          value is the corresponding Zod schema.
 */
export function zod2JsonSchemaDefinitions(
    schema: ZodType,
    definitions: Record<string, any> = {},
    visited: Set<ZodType> = new Set()
): Record<string, any> {
    if (visited.has(schema)) {
        return definitions;
    }
    visited.add(schema);

    const typeName = (schema as any)._zod2x?.typeName;

    if (typeName && definitions[typeName]) {
        return definitions;
    }

    if (ZodHelpers.isZodOptional(schema) || ZodHelpers.isZodNullable(schema)) {
        zod2JsonSchemaDefinitions(schema.unwrap(), definitions, visited);
    } else if (ZodHelpers.isZodArray(schema)) {
        zod2JsonSchemaDefinitions(schema.element, definitions, visited);
    } else if (ZodHelpers.isZodSet(schema)) {
        const innerSchema = (schema as any)._def.valueType;
        zod2JsonSchemaDefinitions(innerSchema, definitions, visited);
    } else if (ZodHelpers.isZodTuple(schema)) {
        for (const item of schema.def.items) {
            zod2JsonSchemaDefinitions(item, definitions, visited);
        }
    } else if (ZodHelpers.isZodAnyMapType(schema)) {
        zod2JsonSchemaDefinitions(schema.def.keyType as ZodType, definitions, visited);
        zod2JsonSchemaDefinitions(schema.def.valueType as ZodType, definitions, visited);
    } else if (ZodHelpers.isZodObject(schema)) {
        for (const value of Object.values(schema.shape)) {
            zod2JsonSchemaDefinitions(value as ZodType, definitions, visited);
        }
    } else if (ZodHelpers.isZodAnyUnionType(schema)) {
        for (const option of schema.options) {
            zod2JsonSchemaDefinitions(option as ZodType, definitions, visited);
        }
    } else if (ZodHelpers.isZodIntersection(schema)) {
        zod2JsonSchemaDefinitions(schema.def.left as ZodType, definitions, visited);
        zod2JsonSchemaDefinitions(schema.def.right as ZodType, definitions, visited);
    }

    if (typeName && !definitions[typeName]) {
        definitions[typeName] = schema;
    }

    return definitions;
}
