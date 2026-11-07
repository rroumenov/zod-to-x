/**
 * Merging of the JSON Schemas of intersections whose members are definitions.
 *
 * Zod represents an intersection with `allOf`. In output JSON Schemas, objects reject the
 * properties they do not declare (`additionalProperties: false`), so `allOf` of two objects with
 * different properties does not validate any object, while `z.intersection` merges them (each
 * object strips the properties it does not declare, and the results are merged). Zod 4.5+ merges
 * the objects of an intersection into one object, but not the ones that are definitions, which
 * are only a reference: the members of intersections with definitions are merged here, with the
 * rules of Zod, into the same `allOf` array, so every JSON Schema that holds it (e.g. wrappers of
 * the intersection) gets the merged object.
 */

type Json = Record<string, any>;

/** Keywords of the objects that can be merged. Annotations of the members are not merged. */
const OBJECT_KEYWORDS = new Set([
    "type",
    "properties",
    "required",
    "additionalProperties",
    "propertyNames",
]);

const MAX_DEPTH = 32;

/** Name of the definition a reference points to (`#/$defs/<name>`, `#/definitions/<name>`). */
export function getDefinitionName(ref: unknown): string | undefined {
    if (typeof ref !== "string") {
        return undefined;
    }

    const match = /^#\/(?:\$defs|definitions)\/([^/]+)$/.exec(ref);
    return match ? match[1].replace(/~1/g, "/").replace(/~0/g, "~") : undefined;
}

/** JSON with sorted keys, to compare JSON Schemas whatever the order of their keywords. */
function canonical(value: unknown): string {
    return JSON.stringify(value, (_key, item) =>
        item && typeof item === "object" && !Array.isArray(item)
            ? Object.fromEntries(
                  Object.keys(item)
                      .sort()
                      .map((key) => [key, item[key]])
              )
            : item
    );
}

/** Constraint of an object on the properties it does not declare (`catchall`), if any. */
function getCatchall(object: Json): Json | undefined {
    const extra = object.additionalProperties;
    return extra && typeof extra === "object" && Object.keys(extra).length > 0 ? extra : undefined;
}

interface IIntersection {
    json: Json;
    allOf: Json[];
    isDefinition: boolean;

    /** Definitions the intersection comes from (if it is a copy), the closest first. */
    sources: string[];
}

/**
 * Merges the intersections of a conversion once the definitions of their members are known.
 * Zod calls the `override` of the definitions in any order, so the intersections wait for them.
 */
export class IntersectionMerger {
    private definitions = new Map<string, Json>();
    private intersections = new Set<IIntersection>();
    private arrays = new Set<Json[]>();

    constructor(private readonly annotations: ReadonlySet<string>) {}

    /** Forgets the JSON Schemas of the previous conversion. */
    reset() {
        this.definitions.clear();
        this.intersections.clear();
        this.arrays.clear();
    }

    addDefinition(name: string, json: Json) {
        this.definitions.set(name, json);
    }

    addIntersection(json: Json, isDefinition: boolean, sources: string[]) {
        if (Array.isArray(json.allOf) && json.allOf.length > 1) {
            this.intersections.add({ json, allOf: json.allOf, isDefinition, sources });
            this.arrays.add(json.allOf);
        }
    }

    /** Merges the intersections whose members are known. */
    mergeReady() {
        let merged = true;
        while (merged) {
            merged = false;
            for (const intersection of this.intersections) {
                const done = this.merge(intersection);
                if (done) {
                    this.intersections.delete(intersection);
                    this.arrays.delete(intersection.allOf);
                    merged = true;
                }
            }
        }
    }

    /** Merges an intersection. Returns `false` if it has to wait for its members. */
    private merge(intersection: IIntersection): boolean {
        const { allOf } = intersection;
        if (allOf.length < 2 || !allOf.some((member) => this.isDefinitionReference(member))) {
            return true; // Not an intersection with definitions: Zod's JSON Schema is kept.
        }

        const objects = allOf.map((member) => this.resolve(member, 0));
        if (objects.some((object) => object === undefined)) {
            return false;
        }
        if (objects.some((object) => object === null)) {
            return true; // A member is not an object: Zod's JSON Schema is kept.
        }

        const merged = this.mergeObjects(objects as Json[], 0);
        if (merged === undefined) {
            return false;
        }
        if (merged === null) {
            return true;
        }

        // A member or a definition the intersection comes from that is the merged object (e.g. the
        // intersection that a copy references) is referenced instead.
        const reference = this.getReferences(intersection).find(
            (candidate) => canonical(this.resolve(candidate, 0)) === canonical(merged)
        );
        allOf.splice(0, allOf.length, reference ?? merged);
        if (reference !== undefined) {
            this.removeReferencedAnnotations(intersection, reference);
        }
        this.unwrap(intersection);
        return true;
    }

    /**
     * References that can replace a merged intersection: its members that are references, and the
     * definitions it comes from, referenced like its members (`$defs` or `definitions`). Names
     * that would be encoded in references are not referenced, as the encoding depends on Zod.
     */
    private getReferences({ allOf, sources }: IIntersection): Json[] {
        const members = allOf.filter((member) => this.isDefinitionReference(member));
        const prefix =
            members.length > 0
                ? /^#\/(?:\$defs|definitions)\//.exec(members[0].$ref)?.[0]
                : undefined;
        const definitions = prefix
            ? sources
                  .filter((name) => this.definitions.has(name) && !/[~/%]/.test(name))
                  .map((name) => ({ $ref: `${prefix}${name}` }))
            : [];

        return [...members, ...definitions];
    }

    /**
     * Removes the annotations that a referenced definition already has (e.g. the description of
     * the intersection that a copy references): Zod can call the override of a copy before its
     * intersection is merged, when the copy does not reference the definition yet.
     */
    private removeReferencedAnnotations({ json, allOf }: IIntersection, reference: Json) {
        const definition = this.definitions.get(getDefinitionName(reference.$ref)!);
        if (json.allOf !== allOf || definition === undefined) {
            return;
        }

        for (const key of Object.keys(json)) {
            if (this.annotations.has(key) && canonical(json[key]) === canonical(definition[key])) {
                delete json[key];
            }
        }
    }

    /**
     * Leaves a merged intersection as the merged object. A reference is only left as `$ref` in a
     * definition: Zod reads the JSON Schema of other schemas after the `override` to build the ones
     * that come from them, and copies `$ref` next to their other keywords (which are ignored next
     * to `$ref` before draft 2019-09).
     */
    private unwrap({ json, allOf, isDefinition }: IIntersection) {
        const keywords = Object.keys(json).filter((key) => !this.annotations.has(key));
        if (json.allOf !== allOf || keywords.join() !== "allOf") {
            return;
        }

        const [member] = allOf;
        if (!this.isReference(member)) {
            delete json.allOf;
            Object.assign(json, member);
        } else if (isDefinition && Object.keys(json).length === 1) {
            // Only without annotations: they are ignored next to `$ref` before draft 2019-09.
            delete json.allOf;
            json.$ref = member.$ref;
        }
    }

    private isReference(node: unknown): boolean {
        return (
            typeof node === "object" &&
            node !== null &&
            Object.keys(node)
                .filter((key) => !this.annotations.has(key))
                .join() === "$ref"
        );
    }

    /** References to definitions of the conversion (not to the ones Zod names `__schema<N>`). */
    private isDefinitionReference(node: unknown): boolean {
        const name = this.isReference(node) ? getDefinitionName((node as Json).$ref) : undefined;
        return name !== undefined && !name.startsWith("__schema");
    }

    /**
     * Object that a member stands for: an object, or the definition that a reference points to.
     * `undefined` if it is not known yet, `null` if it is not an object that can be merged.
     */
    private resolve(node: unknown, depth: number): Json | null | undefined {
        if (depth > MAX_DEPTH || typeof node !== "object" || node === null || Array.isArray(node)) {
            return null;
        }

        const json = node as Json;
        const keywords = Object.keys(json).filter((key) => !this.annotations.has(key));

        if (this.isReference(json)) {
            if (!this.isDefinitionReference(json)) {
                return null;
            }
            const definition = this.definitions.get(getDefinitionName(json.$ref)!);
            return definition === undefined ? undefined : this.resolve(definition, depth + 1);
        }

        if (keywords.join() === "allOf" && Array.isArray(json.allOf)) {
            if (json.allOf.length === 1) {
                return this.resolve(json.allOf[0], depth + 1);
            }
            // An intersection that is not merged yet.
            return this.arrays.has(json.allOf) ? undefined : null;
        }

        if (json.type === "object" && keywords.every((key) => OBJECT_KEYWORDS.has(key))) {
            return Object.fromEntries(keywords.map((key) => [key, json[key]]));
        }

        return null;
    }

    /**
     * Merges objects with the rules of Zod: the properties of all of them (a property declared by
     * several ones has to satisfy all of them), the required properties of all of them, and the
     * properties they do not declare are rejected only if all of them reject them.
     */
    private mergeObjects(objects: Json[], depth: number): Json | null | undefined {
        if (depth > MAX_DEPTH) {
            return null;
        }

        const properties: Json = {};
        const required: string[] = [];

        for (const object of objects) {
            for (const key of Object.keys(object.properties ?? {})) {
                if (Object.prototype.hasOwnProperty.call(properties, key)) {
                    continue;
                }

                const parts: Json[] = [];
                for (const other of objects) {
                    const part = other.properties?.[key] ?? getCatchall(other);
                    if (
                        part !== undefined &&
                        !parts.some((seen) => canonical(seen) === canonical(part))
                    ) {
                        parts.push(part);
                    }
                }

                let value: Json | null | undefined = parts[0];
                if (parts.length > 1) {
                    const nested = parts.map((part) => this.resolve(part, depth + 1));
                    if (nested.some((object) => object === undefined)) {
                        return undefined;
                    }
                    value = nested.every((object) => object !== null)
                        ? this.mergeObjects(nested as Json[], depth + 1)
                        : null;
                    if (value === undefined) {
                        return undefined;
                    }
                    value ??= { allOf: parts };
                }

                Object.defineProperty(properties, key, {
                    value,
                    enumerable: true,
                    writable: true,
                    configurable: true,
                });
            }

            for (const key of object.required ?? []) {
                if (!required.includes(key)) {
                    required.push(key);
                }
            }
        }

        const merged: Json = { type: "object", properties };
        if (required.length > 0) {
            merged.required = required;
        }

        // Constraints on the names of the properties apply to all the properties of the object.
        const propertyNames: Json[] = [];
        for (const constraint of objects.map((object) => object.propertyNames)) {
            if (
                constraint !== undefined &&
                !propertyNames.some((seen) => canonical(seen) === canonical(constraint))
            ) {
                propertyNames.push(constraint);
            }
        }
        if (propertyNames.length > 0) {
            merged.propertyNames =
                propertyNames.length === 1 ? propertyNames[0] : { allOf: propertyNames };
        }

        if (objects.every((object) => object.additionalProperties === false)) {
            merged.additionalProperties = false;
        } else {
            const constraints: Json[] = [];
            for (const constraint of objects.map(getCatchall)) {
                if (
                    constraint &&
                    !constraints.some((seen) => canonical(seen) === canonical(constraint))
                ) {
                    constraints.push(constraint);
                }
            }
            if (constraints.length > 0) {
                merged.additionalProperties =
                    constraints.length === 1 ? constraints[0] : { allOf: constraints };
            }
        }

        return merged;
    }
}
