import { getDeclaredHandle, getDeclaredValue } from "@/layered-modeling/resolver";
import { isUserCopy, resolveZod2xMetadata } from "@/lib/zod2x_metadata";
import { ZodHelpers, ZodTypeAny } from "@/lib/zod_helpers";

/**
 * Name of the definition of a schema. Copies of a type (`.describe()`, `.strict()`) are written
 * where they are used, unless a model declares them.
 */
function getDefinitionName(schema: ZodTypeAny): string | undefined {
    if (!isUserCopy(schema)) {
        return resolveZod2xMetadata(schema)?.typeName;
    }

    const handle = getDeclaredHandle(schema);
    return handle === undefined ? undefined : resolveZod2xMetadata(handle)?.typeName;
}

/**
 * The property of a model is a copy of the schema assigned to it, and models use both. As
 * `zod-to-json-schema` tells schemas apart by their definition, the property of the model that owns
 * a type uses the definition of its schema, so both reference the same definition.
 */
function useDeclaredDefinition(schema: ZodTypeAny, typeName: string | undefined) {
    let value = getDeclaredValue(schema);
    if (value === undefined || typeName === undefined) {
        return;
    }

    while (getDeclaredValue(value) !== undefined && getDefinitionName(value) === typeName) {
        value = getDeclaredValue(value)!;
    }

    if (getDefinitionName(value) === typeName) {
        (schema as any)._def = value._def;
    }
}

/**
 * Recursively extracts custom type definitions from a Zod schema and collects them into a
 * definitions object.
 *
 * This function traverses the provided Zod schema and its nested schemas to collect all schemas
 * that have a custom `typeName` defined with zod2x metadata. It accumulates these
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

    const typeName = getDefinitionName(schema);
    useDeclaredDefinition(schema, typeName);

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
        for (const item of schema.items) {
            zod2JsonSchemaDefinitions(item, definitions, visited);
        }
    } else if (ZodHelpers.isZodAnyMapType(schema)) {
        zod2JsonSchemaDefinitions(schema.keySchema, definitions, visited);
        zod2JsonSchemaDefinitions(schema.valueSchema, definitions, visited);
    } else if (ZodHelpers.isZodObject(schema)) {
        for (const value of Object.values(schema.shape)) {
            zod2JsonSchemaDefinitions(value as ZodTypeAny, definitions, visited);
        }
    } else if (ZodHelpers.isZodAnyUnionType(schema)) {
        for (const option of schema.options) {
            zod2JsonSchemaDefinitions(option, definitions, visited);
        }
    } else if (ZodHelpers.isZodIntersection(schema)) {
        zod2JsonSchemaDefinitions(schema._def.left, definitions, visited);
        zod2JsonSchemaDefinitions(schema._def.right, definitions, visited);
    }

    if (typeName && !definitions[typeName]) {
        definitions[typeName] = schema;
    }

    return definitions;
}
