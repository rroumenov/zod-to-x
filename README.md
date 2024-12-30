# zod-to-x
[`@zod-to-x`](https://github.com/rroumenov/zod-to-x) is a Zod-based library designed to establish a centralized methodology for defining data structures. It allows you to transpile these definitions into various programming languages in a clear and straightforward way. This tool addresses a fundamental requirement of any software: having a clear understanding of the data it handles.



## Table of contents
- [Why use `@zod-to-x`](#why-use-zod-to-x)
- [Installation](#installation)
- [Quick start](#quick-start)
- [Supported output languages](#supported-output-languages)
- [Mapping of supported Zod Types](#mapping-of-supported-zod-types)
- [Additional utils](#additional-utils)



## Why Use [`@zod-to-x`](https://github.com/rroumenov/zod-to-x)?
Managing data consistency across multiple layers and languages is a common challenge in modern software development. [`@zod-to-x`](https://github.com/rroumenov/zod-to-x) solves this by allowing you to define your data models once and effortlessly transpile them into multiple programming languages. Here’s why it stands out:

1. **Centralized Data Definition**  
Define your data structures in one place using the powerful [`@zod`]((https://github.com/colinhacks/zod)) library. This eliminates redundancy, reduces inconsistencies, and simplifies maintenance across your entire codebase, all while allowing you to continue leveraging any npm package in the [`@zod`]((https://github.com/colinhacks/zod)) ecosystem like [`@zod-to-json-schema`](https://github.com/StefanTerdell/zod-to-json-schema)

2. **Multi-Language Compatibility**  
Generate data models for TypeScript, Protobuf V3 and C++ (with languages like Golang on the roadmap). No more manually rewriting models for different platforms.

3. **Enhanced Productivity**  
Automate the transpilation of data models to save time, reduce errors, and let your team focus on business logic instead of boilerplate code.



## Installation
### 1) Install [`@zod-to-x`](https://github.com/rroumenov/zod-to-x) and [`@zod`]((https://github.com/colinhacks/zod)) dependency.
```bash
npm install zod-to-x
```

### 2) Extend Zod using the `extendZod` method after the first [`@zod`]((https://github.com/colinhacks/zod)) import:
```ts
import { z } from "zod";
import { extendZod } from "zod-to-x";
extendZod(z);
```

This extension appends a `zod2x` method to:
- ZodEnum
- ZodNativeEnum
- ZodObject
- ZodUnion
- ZodDiscriminatedUnion
- ZodIntersection
- ZodLiteral

## Quick start
```ts
import { z } from "zod";
import { extendZod, Zod2Ast, Zod2Ts } from "zod-to-x";
extendZod(z); // The extend step can be skipped if it has already been done.

/**
 * 1) Define a data model using Zod schemas
 */
const VisitorSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  visitDate: z.date(),
  comments: z.string().optional(),
}).zod2x("Visitor"); // Add your expected output type name using the 'zod2x' method.

/**
 * 2) Build an AST node of the Zod schema
 */
const visitorNodes = new Zod2Ast().build(VisitorSchema);

/**
 * 3) Generate types in the desired language.
 *    Depending on the transpiled language, data models can be generated using classes.
 */
const tsVisitorAsInterface: string = new Zod2Ts().transpile(visitorNodes);
console.log(tsVisitorAsInterface)
// output:
// export interface Visitor {
//     id: string;
//     name: string;
//     email: string;
//     visitDate: Date;
//     comments?: string;
// }

const tsVisitorAsClass: string = new Zod2Ts({outType: "class"}).transpile(visitorNodes);
console.log(tsVisitorAsClass)
// output:
// export class Visitor {
//     id: string;
//     name: string;
//     email: string;
//     visitDate: Date;
//     comments?: string;

//     constructor(data: Visitor) {
//         this.id = data.id;
//         this.name = data.name;
//         this.email = data.email;
//         this.visitDate = data.visitdate;
//         this.comments = data.comments;
//     }
// }
```


Example of supported schemas with its outputs can be found in the `test` folder:
- [Zod Schemas](test/common)
- [Typescript outputs](test/test_zod2ts)
- [Protobuf V3 outputs](test/test_zod2proto3/)
- [C++ outputs](test/test_zod2cpp/)



## Supported output languages
Common options:
- **header**: Text to add as a comment at the beginning of the output.
- **indent**: Number of spaces to use for indentation in the generated code. Defaults to 4 if not specified.
- **includeComments**: Determines whether to include comments in the transpiled code. Defaults to `true`.
- **skipDiscriminatorNodes**: prevents the inclusion of `ZodEnum` or `ZodNativeEnum` schemas that are used solely as discriminator keys in a `ZodDiscriminatedUnion`. Defaults to `false`.

### 1) Typescript  
- Options:
  - **outType**: Output transpilation using Typescript interfaces or Classes. Defaults to `interface`.

### 2) Protobuf V3
- Options:
  - **packageName**: Name of the protobuf file package.
  - **useCamelCase**: Protobuf follows the snake_case convention for field names, but camelCase can also be used. Defaults to `false`.

- Limitations:
  - `oneof` fields support only unions of `ZodObject` schemas.
  - `ZodTuple` is supported only for items of the same type.


### 3) C++
`Nlohmann` dependency is used for data serialization/deserialization. For *C++11*, `Boost` dependency is used. For *C++17* or newer, standard libraries are used.
- Options:
  - **includeNulls**: When serializing, include all values even if `null`. Defaults to `false`.
  - **namespace**: Name of the namespace containing the output code.
  - **outType**: Output transpilation using C++ Structs or Classes. Defaults to `struct`.
  - **skipSerialize**: Remove Nlohmann JSON serialization/deserialization. Defaults to `false`.

- Limitations:
  - `ZodIntersection` is supported only for intersection of `ZodObject` schemas.



## Mapping of supported Zod Types

| Zod Type              | TypeScript                  | Protobuf                                      | C++                                           |
|-----------------------|-----------------------------|-----------------------------------------------|-----------------------------------------------|
| `z.string()`          | `string`                    | `string`                                      | `std::string`
| `z.number()`          | `number`                    | `double`, `uint32`, `uint64`, `ìnt32`, `int64`| `double`, `uint32_t`, `uint64_t`, `ìnt32_t`, `int64_t`
| `z.bigint()`          | `number`                    | `int64`, `uint64`                             | `int64_t`, `uint64_t`
| `z.boolean()`         | `boolean`                   | `bool`                                        | `bool`
| `z.date()`            | `Date`                      | `google.protobuf.Timestamp`                   | Not supported
| `z.literal()`         | Literal value (`'value'`)   | As number or string                           | As string
| `z.enum()`            | `enum`                      | `enum`                                        | `enum class T: int`
| `z.nativeEnum()`      | Native `enum`               | `enum`                                        | `enum class T: int`
| `z.array()`           | `T[]`                       | `repeated` field                              | `std::vector<T>`
| `z.set()`             | `Set<T>`                    | `repeated` field                              | `std::set<T>`
| `z.tuple()`           | `[T1, T2, T3]`              | `repeated` field                              | `std::tuple<T1, T2, T3>`
| `z.object()`          | `interface` or `class`      | `message`                                     | `struct` or `class`
| `z.record()`          | `Record<string, T>`         | `map<string, K>`                              | `std::unordered_map<T>`
| `z.map()`             | `Map<string, T>`            | `map<string, K>`                              | `std::unordered_map<T>`
| `z.union()` <sup>(2)</sup> | `T1 \| T2` or `type`   | `oneof`                                       | `std::variant<T, K>` (`boost::variant<T, K>` for C++11)
| `z.discriminatedUnion()`| `T1 \| T2` or `type`      | `oneof`                                       | `std::variant<T, K>` (`boost::variant<T, K>` for C++11)
| `z.intersection()` <sup>(1)</sup> | `T1 & T2` or `type`         | Not supported                     | `struct` or `class` with `inheritance`
| `z.any()`             | `any`                       | `google.protobuf.Any`                         | `nlohmann::json`
| `z.optional()`        | `T \| undefined`            | Not supported                                 | `std::optional<T>` (`boost::optional<T>` for C++11)
| `z.nullable()`        | `T \| null`                 | Not supported                                 | `std::optional<T>` (`boost::optional<T>` for C++11)

<sup>(1)</sup> Consider to use Zod's merge instead of ZodIntersection when possible.  
<sup>(2)</sup> Consider to use ZodDiscriminatedUnion when possible. In languages like C++, deserialization is O(1) against the O(n) of the ZodUnion.

## Additional utils
- `zod2JsonSchemaDefinitions`  
In case of use of libraries like [`@zod-to-json-schema`](https://github.com/StefanTerdell/zod-to-json-schema), the provided zod extension can also be used
as a JSON Schema definitions mapper:
```ts
import { z } from 'zod';
import { extendZod, zod2JsonSchemaDefinitions } from 'zod-to-x';
import { zodToJsonSchema } from 'zod-to-json-schema';

extendZod(z);

const Address = z.object({
    street: z.string(),
    city: z.string(),
    zipCode: z.string().nullable(),
}).zod2x("UserAddress");

const UserRole = z.union([
    z.literal('admin'),
    z.literal('editor'),
    z.literal('viewer')
]).zod2x("UserRole");

const StatusEnum = z.enum([
    'active',
    'inactive',
    'pending']
)
.describe("This is a UserStatus enumerate description.")
.zod2x("UserStatus");

export const UserModel = z.object({
    address: Address,
    roles: z.array(UserRole),
    status: StatusEnum,
    friends: z.lazy((): ZodType => UserModel.array().optional().nullable()),
  // [... more attributes]
})
.describe("This is a UserModel interface description.")
.zod2x("UserModel");

const userDefinitions = zod2JsonSchemaDefinitions(UserModel);
const userJsonSchema = zodToJsonSchema(UserModel, {definitions: userDefinitions});
console.log(userJsonSchema);
// output:
// {
//   "$ref": "#/definitions/UserModel",
//   "definitions": {
//     "UserAddress": {
//       "type": "object",
//       "properties": {
//         "street": {
//           "type": "string"
//         },
//         "city": {
//           "type": "string"
//         },
//         "zipCode": {
//           "type": [
//             "string",
//             "null"
//           ]
//         }
//       },
//       "required": [
//         "street",
//         "city",
//         "zipCode"
//       ],
//       "additionalProperties": false
//     },
//     "UserRole": {
//       "type": "string",
//       "enum": [
//         "admin",
//         "editor",
//         "viewer"
//       ]
//     },
//     "UserStatus": {
//       "type": "string",
//       "enum": [
//         "active",
//         "inactive",
//         "pending"
//       ],
//       "description": "This is a UserStatus enumerate description."
//     },
//     "UserModel": {
//       "type": "object",
//       "properties": {
//         "address": {
//           "$ref": "#/definitions/UserAddress"
//         },
//         "roles": {
//           "type": "array",
//           "items": {
//             "$ref": "#/definitions/UserRole"
//           }
//         },
//         "status": {
//           "$ref": "#/definitions/UserStatus"
//         },
//         "friends": {
//           "anyOf": [
//             {
//               "anyOf": [
//                 {
//                   "not": {}
//                 },
//                 {
//                   "type": "array",
//                   "items": {
//                     "$ref": "#/definitions/UserModel"
//                   },
//                   "description": "This is a UserModel interface description."
//                 }
//               ],
//               "description": "This is a UserModel interface description."
//             },
//             {
//               "type": "null"
//             }
//           ],
//           "description": "This is a UserModel interface description."
//         },
//       },
//       "required": [
//         "address",
//         "roles",
//         "status",
//       ],
//       "additionalProperties": false,
//       "description": "This is a UserModel interface description."
//     }
//   },
//   "$schema": "http://json-schema.org/draft-07/schema#"
// }
```