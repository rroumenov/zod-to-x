type TClass = new (...args: any[]) => any;
type TClassUnion<T extends TClass, K extends TClass> = InstanceType<T> & InstanceType<K>;

/**
 * Converts a union type `U` into an intersection type.
 *
 * This utility type works by leveraging conditional types and function inference.
 * It transforms each member of the union into a function parameter and then infers
 * the intersection of all parameter types.
 *
 * @template U - The union type to be converted into an intersection type.
 *
 * @example
 * type Union = { a: string } | { b: number };
 * type Intersection = TUnionToIntersection<Union>;
 * // Result: { a: string } & { b: number }
 */
type TUnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
    ? I
    : never;

/**
 * Extends a base class with additional functionality from a model class.
 *
 * @template T - The model class to extend from.
 * @template K - The base class to be extended.
 * @param Model - The model class providing additional properties or methods.
 * @param BaseClass - The base class to be extended.
 * @returns A new class that combines the functionality of the model and base classes.
 */
function extendBase<T extends TClass, K extends TClass>(
    Model: T,
    BaseClass: K
): new (...args: ConstructorParameters<K>) => TClassUnion<T, K> {
    return class extends BaseClass {
        constructor(...args: any[]) {
            super(...args);
            Object.assign(this, new Model());
        }
    };
}

/**
 * Combines two class constructors into a single unified class.
 * The resulting class merges the properties and methods of both input classes.
 *
 * @template T - The first class type to unify.
 * @template K - The second class type to unify.
 * @param ModelA - The constructor of the first class.
 * @param ModelB - The constructor of the second class.
 * @returns A new class that combines the properties and methods of both input classes.
 */
function unifyModels<T extends TClass, K extends TClass>(ModelA: T, ModelB: K): TClassUnion<T, K> {
    return class {
        constructor() {
            Object.assign(this, new ModelA());
            Object.assign(this, new ModelB());
        }
    } as TClassUnion<T, K>;
}

/**
 * Combines multiple derived classes with a base class into a single class.
 *
 * @template T - A type extending `TClass`, representing the derived classes.
 * @template K - A type extending `TClass`, representing the base class.
 * @param DerivedClasses - An array of derived classes to be combined.
 * @param BaseClass - The base class to be extended.
 * @returns A new class that combines the functionality of the derived classes
 *          and the base class. The resulting class has the constructor of the
 *          base class and the combined instance types of all derived classes.
 * @throws {Error} If no derived classes are provided.
 */
export function Zod2XMixin<T extends TClass, K extends TClass>(
    DerivedClasses: T[],
    BaseClass: K
): new (
    ...args: ConstructorParameters<K>
) => InstanceType<K> & TUnionToIntersection<InstanceType<T>> {
    if (DerivedClasses.length === 0) {
        throw new Error("No derived classes provided");
    } else {
        const CombinedDerivedClass = DerivedClasses.reduce(
            (acc, curr) => unifyModels(acc, curr),
            class {} as new () => TUnionToIntersection<InstanceType<T>>
        );

        return extendBase(CombinedDerivedClass, BaseClass);
    }
}
