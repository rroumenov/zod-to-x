import {
    ZodArray, ZodDiscriminatedUnion, ZodIntersection, ZodMap, ZodNullable, ZodObject, ZodOptional,
    ZodRecord, ZodSet, ZodTuple, ZodTypeAny, ZodUnion
} from 'zod';

/**
 * Recursively extracts custom type definitions from a Zod schema and collects them into a
 * definitions object.
 *
 * This function traverses the provided Zod schema and its nested schemas to collect all schemas
 * that have a custom `typeName` defined in `schema._def.zod2x.typeName`. It accumulates these
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
    schema: ZodTypeAny,
    definitions: Record<string, any> = {},
    visited: Set<ZodTypeAny> = new Set()
): Record<string, any> {
    if (visited.has(schema)) {
        return definitions;
    }
    visited.add(schema);

    const typeName = (schema as any)._def.zod2x?.typeName;

    if (typeName && definitions[typeName]) {
        return definitions;
    }

    if (schema instanceof ZodOptional || schema instanceof ZodNullable) {
        zod2JsonSchemaDefinitions(schema.unwrap(), definitions, visited);
    }
    else if (schema instanceof ZodArray) {
        zod2JsonSchemaDefinitions(schema.element, definitions, visited);
    }
    else if (schema instanceof ZodSet) {
        const innerSchema = (schema as any)._def.valueType;
        zod2JsonSchemaDefinitions(innerSchema, definitions, visited);
    }
    else if (schema instanceof ZodTuple) {
        for (const item of schema.items) {
            zod2JsonSchemaDefinitions(item, definitions, visited);
        }
    }
    else if (schema instanceof ZodRecord || schema instanceof ZodMap) {
        zod2JsonSchemaDefinitions(schema.keySchema, definitions, visited);
        zod2JsonSchemaDefinitions(schema.valueSchema, definitions, visited);
    }
    else if (schema instanceof ZodObject) {
        for (const value of Object.values(schema.shape)) {
            zod2JsonSchemaDefinitions(value as ZodTypeAny, definitions, visited);
        }
    }
    else if (schema instanceof ZodUnion || schema instanceof ZodDiscriminatedUnion) {
        for (const option of schema.options) {
            zod2JsonSchemaDefinitions(option, definitions, visited);
        }
    }
    else if (schema instanceof ZodIntersection) {
        zod2JsonSchemaDefinitions(schema._def.left, definitions, visited);
        zod2JsonSchemaDefinitions(schema._def.right, definitions, visited);
    }

    if (typeName && !definitions[typeName]) {
        definitions[typeName] = schema;
    }

    return definitions;
}