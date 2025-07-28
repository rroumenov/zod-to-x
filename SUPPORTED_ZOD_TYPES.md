
# Mapping of Supported Zod Types by Language
This document provides a comprehensive mapping of Zod types to their equivalent representations in various programming languages and serialization formats. It serves as a general reference for anyone interested in understanding how Zod schemas can be translated into any supported target.

<sup>(1)</sup> Consider to use Zod's merge instead of ZodIntersection when possible.  
<sup>(2)</sup> Consider to use ZodDiscriminatedUnion when possible. In languages like C++, deserialization is O(1) against the O(n) of the ZodUnion.

## Index of Languages
- [TypeScript](#typescript)
- [C++](#c-1)
- [Others](#others)
    - [Protobuf](#protobuf)



## TypeScript
| Zod Type                  | TypeScript Representation       |
|---------------------------|----------------------------------|
| `z.string()`              | `string`                       |
| `z.number()`              | `number`                       |
| `z.bigint()`              | `number`                       |
| `z.boolean()`             | `boolean`                      |
| `z.date()`                | `Date`                         |
| `z.literal()`             | Literal value (`'value'`)      |
| `z.enum()`                | `enum`                         |
| `z.array()`               | `T[]`                          |
| `z.set()`                 | `Set<T>`                       |
| `z.tuple()`               | `[T1, T2, T3]`                 |
| `z.object()`              | `interface` or `class`         |
| `z.record()`              | `Record<string, T>`            |
| `z.map()`                 | `Map<string, T>`               |
| `z.union()` <sup>(2)</sup>               | `T1 \| T2` or `type`           |
| `z.discriminatedUnion()`  | `T1 \| T2` or `type`           |
| `z.intersection()` <sup>(1)</sup>        | `T1 & T2` or `type`            |
| `z.any()`                 | `any`                          |
| `z.optional()`            | `T \| undefined`               |
| `z.nullable()`            | `T \| null`                    |



## C++
| Zod Type                  | C++ Representation             |
|---------------------------|----------------------------------|
| `z.string()`              | `std::string`                  |
| `z.number()`              | `double`, `uint32_t`, `uint64_t`, `int32_t`, `int64_t` |
| `z.bigint()`              | `int64_t`, `uint64_t`          |
| `z.boolean()`             | `bool`                         |
| `z.date()`                | Not supported                  |
| `z.literal()`             | As string                      |
| `z.enum()`                | `enum class T: int`            |
| `z.array()`               | `std::vector<T>`               |
| `z.set()`                 | `std::set<T>`                  |
| `z.tuple()`               | `std::tuple<T1, T2, T3>`       |
| `z.object()`              | `struct` or `class`            |
| `z.record()`              | `std::unordered_map<T>`        |
| `z.map()`                 | `std::unordered_map<T>`        |
| `z.union()` <sup>(2)</sup>               | `std::variant<T, K>` (`boost::variant<T, K>` for C++11) |
| `z.discriminatedUnion()`  | `std::variant<T, K>` (`boost::variant<T, K>` for C++11) |
| `z.intersection()` <sup>(1)</sup>        | `struct` or `class` with `inheritance` |
| `z.any()`                 | `nlohmann::json`               |
| `z.optional()`            | `std::optional<T>` (`boost::optional<T>` for C++11) |
| `z.nullable()`            | `std::optional<T>` (`boost::optional<T>` for C++11) |



## Others

### Protobuf
| Zod Type                  | Protobuf Representation         |
|---------------------------|----------------------------------|
| `z.string()`              | `string`                       |
| `z.number()`              | `double`, `uint32`, `uint64`, `int32`, `int64` |
| `z.bigint()`              | `int64`, `uint64`              |
| `z.boolean()`             | `bool`                         |
| `z.date()`                | `google.protobuf.Timestamp`    |
| `z.literal()`             | As number or string            |
| `z.enum()`                | `enum`                         |
| `z.array()`               | `repeated` field               |
| `z.set()`                 | `repeated` field               |
| `z.tuple()`               | `repeated` field               |
| `z.object()`              | `message`                      |
| `z.record()`              | `map<string, K>`               |
| `z.map()`                 | `map<string, K>`               |
| `z.union()` <sup>(2)</sup>               | `oneof`                        |
| `z.discriminatedUnion()`  | `oneof`                        |
| `z.intersection()` <sup>(1)</sup>        | Not supported                  |
| `z.any()`                 | `google.protobuf.Any`          |
| `z.optional()`            | Not supported                  |
| `z.nullable()`            | Not supported                  |