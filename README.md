# zod-to-x
[`@zod-to-x`](https://github.com/rroumenov/zod-to-x) is a Zod-based library designed to establish a centralized methodology for defining data structures. It allows you to transpile these definitions into various programming languages in a clear and straightforward way. This tool addresses a fundamental requirement of any software: having a clear understanding of the data it handles.



## Table of contents
- [Why use `@zod-to-x`](#why-use-zod-to-x)
- [Installation](#installation)
- [Quick start](#quick-start)
- [Supported output languages](#supported-output-languages)
- [Mapping of supported Zod Types](#mapping-of-supported-zod-types)
- [Additional utils](#additional-utils)
- [Known limitations](#known-limitations)



## Why Use [`@zod-to-x`](https://github.com/rroumenov/zod-to-x)?
In modern software development, managing data consistency across multiple layers and languages is a persistent challenge. [`@zod-to-x`](https://github.com/rroumenov/zod-to-x) tackles this problem head-on by enabling you to define your data models once, in a centralized and expressive way, and then effortlessly transpile these models into multiple programming languages. Here's why [`@zod-to-x`](https://github.com/rroumenov/zod-to-x) stands out:

1. Centralized Data Definition  
With [`@zod-to-x`](https://github.com/rroumenov/zod-to-x), you define your data structures in one place using the powerful Zod library. This eliminates redundancy, reduces the risk of inconsistencies, and simplifies maintenance across your codebase.

2. Multi-Language Compatibility  
Gone are the days of manually rewriting data models for different platforms. [`@zod-to-x`](https://github.com/rroumenov/zod-to-x) lets you generate data types for:

    - TypeScript: Build strong, type-safe interfaces or classes for front-end and back-end applications.
    - Protobuf V3: Seamlessly integrate with gRPC and other Protobuf-based systems.
    - More Languages: Support for additional languages like C++ is on the roadmap.

3. Enhanced Productivity  
By automating the transpilation of data models, [`@zod-to-x`](https://github.com/rroumenov/zod-to-x) allows your team to focus on writing business logic instead of boilerplate code. Changes to schemas are propagated automatically, saving time and minimizing errors.

4. Built on Zod's Robust Ecosystem  
[`@zod-to-x`](https://github.com/rroumenov/zod-to-x) extends the capabilities of Zod, a popular and intuitive schema validation library. This means you can:

    - Leverage Zod's wide array of schema types and validations.
    - Maintain compatibility with existing Zod-based projects.
    - Easily integrate with tools like [`@zod-to-json-schema`](https://github.com/StefanTerdell/zod-to-json-schema).

5. Flexible Output Options  
Whether you need plain interfaces, full-fledged classes with constructors, or Protobuf definitions, [`@zod-to-x`](https://github.com/rroumenov/zod-to-x) can adapt to your specific needs with customizable output formats.

6. Transparent and Extendable  
The library is designed to be lightweight, transparent, and easy to integrate into existing workflows. Its extendable architecture ensures it can evolve to meet your project’s growing demands.

7. Ideal for Cross-Language Development  
If your application spans multiple languages—like a front-end in TypeScript, a back-end in Python, and microservices in Protobuf—[`@zod-to-x`](https://github.com/rroumenov/zod-to-x) simplifies the process of keeping data structures consistent across the stack.



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

## Quick start
### 1) Define a data model using Zod schemas
```ts
import { z } from "zod";

// Skip the extend step if it has already been done.
import { extendZod } from "zod-to-x";
extendZod(z);

const VisitorSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  visitDate: z.date(),
  comments: z.string().optional(),
}).zod2x("Visitor");    // Add your expected output type name using the 'zod2x' method.

```

### 2) Build an AST node of the Zod schema
```ts
import { Zod2Ast } from "zod-to-x";

const visitorNodes = new Zod2Ast().build(VisitorSchema);
```

### 3) Generate types in the desired language
```ts
import { Zod2Ts } from "zod-to-x";

const tsVisitor: string = new Zod2Ts().transpile(visitorNodes);
console.log(tsVisitor)
// output:
// export interface Visitor {
//     id: string;
//     name: string;
//     email: string;
//     visitDate: Date;
//     comments?: string;
// }
```
Depending on the transpiled language, data models can be generated using classes:

```ts
import { Zod2Ts } from "zod-to-x";

const tsVisitor: string = new Zod2Ts({outType: "class"}).transpile(visitorNodes);
console.log(tsVisitor)
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


A complete and more complex schema definition with its outputs can be found in the `test` folder:
- [Zod Schemas](test/data)
- [Typescript outputs](test/test_zod2ts)
- [Protobuf V3 outputs](test/test_zod2proto3/)



## Supported output languages
Common options:
- **header**: Text to add as a comment at the beginning of the output.
- **indent**: Number of spaces to use for indentation in the generated code. Defaults to 4 if not specified.
- **includeComments**: Determines whether to include comments in the transpiled code. Defaults to `true`.

### · **Typescript**  
Options:
  - **outType**: Output transpilation using Typescript interfaces or Classes.

### · Protobuf V3
Options:
  - **packageName**: Name of the protobuf file package.
  - **useCamelCase**: Protobuf follows the snake_case convention for field names, but camelCase can also be used. Defaults to `false`.

### · C++ (upcoming)



## Mapping of supported Zod Types

| Zod Type          | TypeScript                  | Protobuf                                      |
|-------------------|-----------------------------|-----------------------------------------------|
| `z.string()`      | `string`                    | `string`                                      |
| `z.number()`      | `number`                    | `double`, `uint32`, `uint64`, `ìnt32`, `int64`|
| `z.bigint()`      | `number`                    | `int64`, `uint64`                             |
| `z.boolean()`     | `boolean`                   | `bool`                                        |
| `z.date()`        | `Date`                      | `google.protobuf.Timestamp`                   |
| `z.literal()`     | Literal value (`'value'`)   | `number` or `string`                          |
| `z.enum()`        | `enum`                      | `enum`                                        |
| `z.nativeEnum()`  | Native `enum`               | `enum`                                        |
| `z.array()`       | `T[]`                       | `repeated` field                              |
| `z.set()`         | `Set<T>`                    | `repeated` field                              |
| `z.tuple()`       | `[T1, T2, T3]`              | Not supported                                 |
| `z.object()`      | `interface` or `class`      | `message`                                     |
| `z.record()`      | `Record<string, T>`         | `map<string, K>`                              |
| `z.union()`       | `T1 \| T2` or `type`        | `oneof`                                       |
| `z.intersection()`| `T1 & T2` or `type`         | Not supported                                 |
| `z.any()`         | `any`                       | `google.protobuf.Any`                         |
| `z.optional()`    | `T \| undefined`            | Not supported                                 |
| `z.nullable()`    | `T \| null`                 | Not supported                                 |



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



## Known limitations
- Protobuf V3:  
  - `oneof` fields support only unions of `ZodObject` schemas.