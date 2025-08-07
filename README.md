<p align="center">
  <img src="zod2x_image.png" alt="zod-to-x" style="max-width: 100%; height: auto;"><br>
  <em style="font-size: smaller;">Image generated using Canvas AI.</em>
</p>
<p align="center">
  <a href="https://github.com/rroumenov/zod-to-x/releases" target="_blank">
    <img src="https://img.shields.io/badge/View%20Changelog-brightgreen?style=for-the-badge" alt="View Changelog">
  </a>
  <a href="https://playcode.io/2277071" target="_blank" style="margin-left: 10px;">
    <img src="https://img.shields.io/badge/Try%20it%20on%20Playcode-blue?style=for-the-badge" alt="Try it on Playcode">
  </a>
  <a href="https://github.com/rroumenov/zod-to-x/issues" target="_blank" style="margin-left: 10px;">
    <img src="https://img.shields.io/badge/Need%20Help%3F-orange?style=for-the-badge" alt="Need Help?">
  </a>
</p>



[`@zod-to-x`](https://github.com/rroumenov/zod-to-x) is a Zod-based library designed to establish a centralized methodology for defining data structures. It allows you to transpile these definitions into various programming languages in a clear and straightforward way. This tool addresses a fundamental requirement of any software: having a clear understanding of the data it handles.



## Table of contents
- [Why use `@zod-to-x`](#why-use-zod-to-x)
- [Installation](#installation)
- [Quick start](#quick-start)
- [Intersections and Unions](#intersections-and-unions)
  - [Expected outputs](#expected-outputs)
  - [Tips for discriminated unions](#tips-for-discriminated-unions)
- [Layered modeling](#layered-modeling) <sup>*(new)*</sup>
  - [Usage example](#usage-example)
  - [Custom layers](#custom-layers)
- [Currently supported output languages](#currently-supported-output-languages)
  - [Typescript](#1-typescript)
  - [C++](#2-c)
- [Additional utils](#additional-utils)
  - [JSON Schema definitions](#1-zod2jsonschemadefinitions)
  - [Protobuf V3 generation](#2-zod2protov3)
- [Mapping of supported Zod Types by Language](#mapping-of-supported-zod-types-by-langauge)
- [Considerations](#considerations)



## Why Use [`@zod-to-x`](https://github.com/rroumenov/zod-to-x)?
Managing data consistency across multiple layers and languages is a common challenge in modern software development. [`@zod-to-x`](https://github.com/rroumenov/zod-to-x) solves this by allowing you to define your data models once and effortlessly transpile them into multiple programming languages. Here’s why it stands out:

1. **Centralized Data Definition**  
Define your data structures in one place using the powerful [`@zod`](https://github.com/colinhacks/zod) library. This eliminates redundancy, reduces inconsistencies, and simplifies maintenance across your entire codebase, all while allowing you to continue leveraging any npm package in the [`@zod`](https://github.com/colinhacks/zod) ecosystem like [`@zod-to-json-schema`](https://github.com/StefanTerdell/zod-to-json-schema)

2. **Multi-Language Compatibility**  
Generate data models for TypeScript, Protobuf V3 and C++ (with languages like Golang on the roadmap). No more manually rewriting models for different platforms.

3. **Enhanced Productivity**  
Automate the transpilation of data models to save time, reduce errors, and let your team focus on business logic instead of boilerplate code.


## Installation
### 1) Install [`@zod-to-x`](https://github.com/rroumenov/zod-to-x) and [`@zod(*)`](https://github.com/colinhacks/zod) dependency.
```bash
npm install zod-to-x zod
```
(*) [`zod@3.22.3`](https://www.npmjs.com/package/zod/v/3.22.0) version or greather is required.

### 2) Extend Zod using the `extendZod` method after the first [`@zod`](https://github.com/colinhacks/zod) import:
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
import { extendZod, Zod2Ast, Zod2XTranspilers } from "zod-to-x";
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
const tsVisitorAsInterface: string = new Zod2XTranspilers.Zod2Ts().transpile(visitorNodes);
console.log(tsVisitorAsInterface)
// output:
// export interface Visitor {
//     id: string;
//     name: string;
//     email: string;
//     visitDate: Date;
//     comments?: string;
// }

const tsVisitorAsClass: string = new Zod2XTranspilers.Zod2Ts({outType: "class"}).transpile(visitorNodes);
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



## Intersections and Unions
Starting from `v1.3.0`, a best practices helper is enabled by default when handling data intersections and unions:
- Intersections and Unions can only be performed between ZodObject schemas.
- Discriminant unions shall be used instead of Unions.

These rules help ensure that each data model follows the single responsibility principle. Otherwise, an error will be thrown when building an `ASTNode`.

**NOTE**: You can disable these rules at your own risk by setting the `strict` flag to `false` when building the `ASTNode` data model. However, any unexpected behavior or issues resulting from this will not be supported.

### Expected outputs
- **For Intersections**: whenever possible, an intersection is transpiled into a struct/class that inherits from the intersected data models. Otherwise, a new struct/class is created, where attributes are the result of merging the intersected data models. Any shared key is overridden by the last matching type.
```ts
const DataA = z.object({ keyA: z.string(), keyC: z.string() }).zod2x("DataA");
const DataB = z.object({ keyB: z.string(), keyC: z.number() }).zod2x("DataB");
const Intersection = z.intersection(DataA, DataB).zod2x("Intersection");

// C++ case (with inheritance)
// struct Intersection : public DataA, public DataB {
//   // Intersection fields are inherited from base structs.
// };

// Typescript case (with attribute merging)
// class Intersection {
//   keyA: string;
//   keyB: string;
//   keyC: number; // Shared key overriden using the last type.
// };
```
- **For Unions**: whenever possible, a union is transpiled into a variant type composed of the united data models. Otherwise, a new struct/class is created, where attributes are the result of merging the intersected data models. Any common key is preserved as is (if only its requirement differs, it is changed to optional). Other keys are also set as optional.
```ts
const DataA = z.object({ keyA: z.string(), keyD: z.string() }).zod2x("DataA");
const DataB = z.object({ keyB: z.string(), keyD: z.string() }).zod2x("DataB");
const Intersection = z.intersection(DataA, DataB).zod2x("Intersection");

// C++ case (with variant type)
// using Intersection = std::variant<DataA, DataB>;

// Typescript case (with attributes merge)
// class Intersection {
//   keyA?: string; // Different keys are set as optional
//   keyB?: string;
//   keyD: number; // Shared key preserved as is.
// };
```



### Tips for discriminated unions
To enhance data modeling and the serialization/deserialization of a discriminated union type, two key steps should be considered:
- Using `ZodEnum` or `ZodNativeEnum` the define the discriminator key options.
- Using `ZodLiteral` to define the specific value of the discriminator key.

Example of discriminant definition:
```ts
// Define message types
export const MsgType = z.enum(["TypeA", "TypeB"]).zod2x("MsgType");

// Define different message structures based on the 'msgType' value.
const MessageA = z
    .object({
        key: z.string(),

        // Assign the type using the corresponding MsgType value and link it with 'zod2x'.
        msgType: z.literal(MsgType.Values.TypeA).zod2x(MsgType),  
    })
    .zod2x("MessageA");

const MessageB = z
    .object({
        otherKey: z.string(),

        // Same process as MessageA.
        msgType: z.literal(MsgType.Values.TypeB).zod2x(MsgType),
    })
    .zod2x("MessageB");

// Define the main Message type using ZodDiscriminatedUnion.
export const Message = z
    .discriminatedUnion("msgType", [MessageA, MessageB])
    .zod2x("Message");
```

Example of C++ output:
```cpp
// Discriminated union with direct serialization/deserialization
inline void from_json(const json& j, Message& x) {
    const auto& k = j.at("msgType").get<std::string>();
    if (k == "TypeA") {
        x = j.get<MessageA>();
    }
    else if (k == "TypeB") {
        x = j.get<MessageB>();
    }
    else {
        throw std::runtime_error("Failed to deserialize Message: unknown format");
    }
}



// Using a regular union or a discriminated union without the above approach:
// Fallback to try-catch for serialization/deserialization
inline void from_json(const json& j, Message& x) {
  try {
      x = j.get<MessageA>();
      return;
  } catch (const std::exception&) {
  }
  try {
      x = j.get<MessageB>();
      return;
  } catch (const std::exception&) {
      throw std::runtime_error("Failed to deserialize Message: unknown format");
  }
}
```


## Layered modeling
To improve Separation of Concerns (SoC), the Dependency Rule, and Maintainability, a new layer-based modeling approach was introduced in `v1.4.0`. This approach establishes relationships between models in separate files, which are transpiled into file imports. This feature provides a powerful tool not only for type systems with robust architectures, such as Clean, Hexagonal, or Layered, but also enforces their usage.

To achieve this, new components are included:
- **Zod2XModel**: With layered modeling, data is defined using classes. Inheriting this abstract class provides metadata management to handle relationships and also simplifies transpilation by including a `transpile()` method that receives the target language class.
- **Layer**: A class decorator that defines class metadata, including a reference to the output file of the modeled data, a namespace under which its types are grouped, and an integer index representing the layer number. It can also be used as a decorator factory to define custom layers. Out of the box, four layers are provided: *Domain*, *Application*, *Infrastructure*, and *Presentation*. Parameters:  
  - **index**: Defines the layer boundary. In layer terms, a greater number represents a more external layer. Outer layers can use models from equal or lower layers, but not from higher layers. Otherwise, an error will be raised.
  - **namespace**: Defines the namespace under which the types are grouped.
  - **file**: Specifies the expected output file where the transpiled types will be saved.
  - **externalInheritance**: When a type from one layer is imported into another layer without modifications, it is transpiled as a new type inheriting from the imported type. This ensures type consistency across layers while maintaining reusability. See example (4) below. The default value is `true`.
  - **basicTypes**: Since `v1.4.6`, primitive data types and arrays are also transpiled when using Layered modeling **if they are declared as property inside the layer class**. They are output as aliases of the types they represent. Setting it to `false` will disable this behavior (except for arrays, which are always transpiled). Default is `true`.
- **Zod2XMixin**: A function that enables the creation of layers by extending multiple data models, thereby simplifying their definition and organization.

### Usage example
1. Define a Domain model, such as a User entity:
```ts
@Domain({ namespace: "USER", file: "user.entity" })
class UserModels extends Zod2XModel {

    userRole = z.enum(["Admin", "User"]).zod2x("UserRole"); // (*)

    userEmail = z.string().email(); // This will be transpiled as an alias.

    userEntity = z.object({
        id: z.string().uuid(),
        name: z.string().min(1),
        email: this.userEmail,
        age: z.number().int().nonnegative().optional(),
        role: this.userRole,
    }); // (*)
}

const userModels = new UserModels();
console.log(userModels.transpile(Zod2XTranspilers.Zod2Ts));
// Output:
// export enum UserRole {
//     Admin = "Admin",
//     User = "User",
// }

// export type UserEmail = string;

// export interface UserEntity {
//     id: string;
//     name: string;
//     email: UserEmail;
//     age?: number;
//     role: UserRole;
// }

// export interface UserModels {
//     userRole: UserRole;
//     userEntity: UserEntity;
// }

```
**(*)** Thanks to the Layer decorator, the use of `zod2x` for type naming can now be omitted, simplifying and clarifying the process of model definition. By default, it will take the property name and apply a Pascal case convention (example: *myProperty* -> *MyProperty*).  
You can still use it if you want to enforce a different type name.

2. Define an Application model, such as a User DTO:
```ts
// Create DTOs using previously defined user models.
@Application({ namespace: "USER_DTOS", file: "user.dtos" })
class UserDtos extends Zod2XModel {

    createUserUseCaseDto = userModels.userEntity.omit({ id: true });  // (*)

    createUserUseCaseResultDto = userModels.userEntity
        .omit({ role: true })
        .extend({
            createdAt: z.date(),
            updatedAt: z.date(),
        }); // (*)
}

const userDtos = new UserDtos();
console.log(userDtos.transpile(Zod2XTranspilers.Zod2Ts))
// Output:
// import * as USER from "./user.entity";    <--- Reusing models from other layers.

// export interface CreateUserUseCaseDto {
//     name: string;
//     email: USER.UserEmail;
//     age?: number;
//     role: USER.UserRole;
// }

// export interface CreateUserUseCaseResultDto {
//     id: string;
//     name: string;
//     email: USER.UserEmail;
//     age?: number;
//     createdAt: Date;
//     updatedAt: Date;
// }

// export interface UserDtos {
//     createUserUseCaseDto: CreateUserUseCaseDto;
//     createUserUseCaseResultDto: CreateUserUseCaseResultDto;
// }

```
**(*)** Any modification of an existing model (in this case, `userEntity`) will lose the relation with that model, but not its children. In the case of the `CreateUserUseCaseDto` type, the `role` field will remain linked to the existing one in the `user.entity` file.

3 - Are your models too large? Simplify them!  
If you are dealing with complex models whose definitions are too extensive, split them into multiple classes and then combine them using `Zod2XMixin` as shown below:
```ts
import { Zod2XMixin } from "zod-to-x";

// Sub-models do not require a layer decorator; it is applied automatically when inherited by the main model.

// Sub-model 1
class CreateUserUseCaseDto {
    createUserUseCaseDto = userModels.userEntity.omit({ id: true });
}

// Sub-model 2
class CreateUserUseCaseResultDto {
    createUserUseCaseResultDto = userModels.userEntity
        .omit({ role: true })
        .extend({
            createdAt: z.date(),
            updatedAt: z.date(),
        });
}

// Main model
@Application({ namespace: "USER_DTOS", file: "user.dtos" })
class UserDtos extends Zod2XMixin(
    [CreateUserUseCaseDto, CreateUserUseCaseResultDto], // Inherit the desired sub-models.
    Zod2XModel  // Zod2XModel must still be the base class.
) {}

export const userDtos = new UserDtos();
console.log(userDtos.transpile(Zod2XTranspilers.Zod2Ts))
// Output (same as above):
// import * as USER from "./user.entity";    <--- Reusing models from other layers.

// export interface CreateUserUseCaseDto {
//     name: string;
//     email: string;
//     age?: number;
//     role: USER.UserRole;
// }

// export interface CreateUserUseCaseResultDto {
//     id: string;
//     name: string;
//     email: string;
//     age?: number;
//     createdAt: Date;
//     updatedAt: Date;
// }

// export interface UserDtos {
//     createUserUseCaseDto: CreateUserUseCaseDto;
//     createUserUseCaseResultDto: CreateUserUseCaseResultDto;
// }
```

4 - Difference of using **externalInheritance** (defaults) or not.  
```ts
// Default output (externalInheritance = true)
@Application({ namespace: "USER_DTOS", file: "user.dtos" })
class UserDtos extends Zod2XModel {

    createUserUseCaseDto = userModels.userEntity.omit({ id: true });

    createUserUseCaseResultDto = userModels.userEntity;
}

// Output:
// import * as USER from "./user.entity";

// export interface CreateUserUseCaseDto {
//     name: string;
//     email: string;
//     age?: number;
//     role: USER.UserRole;
// }

// export interface CreateUserUseCaseResultDto extends USER.UserEntity {}

// export interface UserDtos {
//     createUserUseCaseDto: CreateUserUseCaseDto;
//     createUserUseCaseResultDto: CreateUserUseCaseResultDto;
// }

// ---------------
// If `USER.UserEntity` were a Union or a Discriminated Union, the output would be a Type equivalent to `USER.UserEntity` rather than an Interface that extends it.  

```

```ts
// Output without externalInheritance
@Application({ namespace: "USER_DTOS", file: "user.dtos",  externalInheritance: false})
class UserDtos extends Zod2XModel {

    createUserUseCaseDto = userModels.userEntity.omit({ id: true });

    createUserUseCaseResultDto = userModels.userEntity;
}

// Output:
// import * as USER from "./user.entity";

// export interface CreateUserUseCaseDto {
//     name: string;
//     email: string;
//     age?: number;
//     role: USER.UserRole;
// }

// export interface UserDtos {
//     createUserUseCaseDto: CreateUserUseCaseDto;
//     createUserUseCaseResultDto: USER.UserEntity;
// }

// ---------------
// In this case, the type of `createUserUseCaseResultDto` is inferred from the parent model (`UserDtos`), but there is no explicit definition of the type itself.
```

### Custom Layers
If the provided layer decorators do not meet your requirements, you can easily define custom ones:
```ts
import { Layer, IZod2xLayerMetadata, Zod2XModel } from "zod-to-x";

// Create an enumerate with layer indexes
enum MyLayers {
    MyDomainLayer = 0,
    MyApplicationLayer = 1,
    MyInfrastructureLayer = 2,
    // ...
}

// Create custom layer decorators
function MyDomainLayer(opt: Omit<IZod2xLayerMetadata, "index">) {
  return Layer({ ...opt, index: MyLayers.MyDomainLayer });
}
// ...

// Use the custom decorators
@MyDomainLayer({file: "...", namespace: "..."})
class MyEntityModels extends Zod2XModel {
  // ...
}
```

## Currently supported output languages
Common options:
- **header**: Text to add as a comment at the beginning of the output.
- **indent**: Number of spaces to use for indentation in the generated code. Defaults to 4 if not specified.
- **includeComments**: Determines whether to include comments in the transpiled code. Defaults to `true`.

### 0) ASTNode
- Options:
  - **strict**: When true, it will throw an error if a bad data modeling practice is detected. Default is `true`.

### 1) Typescript  
- Options:
  - **outType**: Output transpilation using Typescript interfaces or Classes. Defaults to `interface`.
  - **keepKeys**: Specifies whether property names should follow the TypeScript naming convention (false) or remain as originally defined (true). The default is `false`.
- [Examples](https://github.com/rroumenov/zod-to-x/blob/main/test/test_zod2ts)

### 2) C++
`Nlohmann` dependency is used for data serialization/deserialization. For *C++11*, `Boost` dependency is used. For *C++17* or newer, standard libraries are used.
- Options:
  - **includeNulls**: When serializing, include all values even if `null`. Defaults to `false`.
  - **namespace**: Name of the namespace containing the output code.
  - **outType**: Output transpilation using C++ Structs or Classes. Defaults to `struct`.
  - **skipSerialize**: Remove Nlohmann JSON serialization/deserialization. Defaults to `false`.
  - **keepKeys**: Specifies whether property names should follow the C++ naming convention (false) or remain as originally defined (true). The default is `false`.
- [Examples](https://github.com/rroumenov/zod-to-x/blob/main/test/test_zod2cpp)



## Additional utils
Additional useful tools to convert Zod Schemas into different formats.

### 1) `zod2JsonSchemaDefinitions`  
In case of use of libraries like [`@zod-to-json-schema`](https://github.com/StefanTerdell/zod-to-json-schema), the provided zod extension can also be used as a JSON Schema definitions mapper. Check out this [input example](https://github.com/rroumenov/zod-to-x/blob/main/test/test_zod2jschema_def/user_schema.ts) and its [output](https://github.com/rroumenov/zod-to-x/blob/main/test/test_zod2jschema_def/user_schema.json) (\*).

<sup>*(\*) Output is generated using definitions from `zod2JsonSchemaDefinitions` and [`@zod-to-json-schema`](https://github.com/StefanTerdell/zod-to-json-schema) to create the schema with them.*</sup>

```ts
import { z } from 'zod';
import { extendZod, Zod2XConverters } from 'zod-to-x';
import { zodToJsonSchema } from 'zod-to-json-schema';
extendZod(z);

// Example using model from `Quick-start` section
const visitorDefinitions = Zod2XConverters.zod2JsonSchemaDefinitions(VisitorSchema);
const visitorJsonSchema = zodToJsonSchema(
  VisitorSchema,
  {definitions: visitorDefinitions}
);
console.log(visitorJsonSchema); // JSON Schema with definitions

// Example using model from `Layer modeling` section
const createUserDtoDefinitions = Zod2XConverters.zod2JsonSchemaDefinitions(userDtos.createUserUseCaseDto);
const createUserDtoJsonSchema = zodToJsonSchema(
  userDtos.createUserUseCaseDto,
  {definitions: createUserDtoDefinitions}
);
console.log(createUserDtoJsonSchema); // JSON Schema with definitions
```

### 2) `zod2ProtoV3`
In case of use of Google protobuf to improve communication performance, you can automatically generate `proto` files directly from your models. Check out this [input example](https://github.com/rroumenov/zod-to-x/blob/main/test/test_zod2proto3/proto3_supported_schemas.ts) and its [output](https://github.com/rroumenov/zod-to-x/blob/main/test/test_zod2proto3/proto3_supported_schemas.expect.proto)

- Options:
  - **packageName**: Name of the protobuf file package.
  - **header**: Text to add as a comment at the beginning of the output.
  - **indent**: Number of spaces to use for indentation in the generated code. Defaults to 4 if not specified.
  - **includeComments**: Determines whether to include comments in the transpiled code. Defaults to `true`.
  - **keepKeys**: Specifies whether property names should follow the Google Protobuf naming convention (false) or remain as originally defined (true). The default is `false`.
  - **encodeDoubleAsInt**: Double values will be represented as integers in the proto file. Defaults to `false`.

- Limitations:
  - ZodTuple is supported only for items of the same type.

```ts
import { z } from 'zod';
import { extendZod, Zod2XConverters } from 'zod-to-x';
import { zodToJsonSchema } from 'zod-to-json-schema';
extendZod(z);

// Example using model from `Quick-start` section
const visitorProtobuf = Zod2XConverters.zod2ProtoV3(VisitorSchema);
console.log(visitorProtobuf); // Proto file of Visitor's model

// Example using model from `Layer modeling` section
const createUserDtoProtobuf = Zod2XConverters.zod2ProtoV3(userDtos.createUserUseCaseDto);
console.log(createUserDtoProtobuf); // Proto file of CreateUserUseCaseDto's model
```



## Mapping of supported Zod Types by Langauge
For a detailed mapping of supported Zod types across supported targets, please refer to the [SUPPORTED_ZOD_TYPES.md](https://github.com/rroumenov/zod-to-x/blob/main/SUPPORTED_ZOD_TYPES.md) file.



## Considerations
- Choose the approach that best suits your needs, either Layered or non-Layered modeling, and avoid mixing them whenever possible, especially when working with enumerations, objects, unions, or intersections (except for `ZodLiteral.zod2x()`, which simply links a literal value to the enumeration it belongs to, if applicable). Their metadata handling differs slightly, which may result in some types not being transpiled as expected.

- In Layered modeling, the transpilation of primitive types can be completely disabled or combined by defining them outside the layer class:
```ts
// External primitive
const stringUUID = z.string().uuid();

@Domain({ namespace: "USER", file: "user.entity" })
class UserModels extends Zod2XModel {

    // Internal primitive
    userEmail = z.string().email(); // This will be transpiled as an alias. It is a layer property.

    userEntity = z.object({
        id: stringUUID, // "stringUUID" will not be transpiled as an alias. It is not a layer property.
        email: this.userEmail,
    });
}

export const userModels = new UserModels();
```

- Avoid internal alias redeclarations. If really needed, `ZodLazy` shall be used:
```ts
// Consider the previous UserModels

import { z } from "zod";

@Application({ namespace: "USER_DTOS", file: "user.dtos",  externalInheritance: false})
class UserDtos extends Zod2XModel {

    // OK - Type declaration. It creates a new type based on userEntity but without ID.
    createUserUseCaseDto = userModels.userEntity.omit({ id: true });

    // OK - Redeclaration of external type. Could be useful for typing coherence.
    // "createUserUseCaseResultDto" becomes an alias of "userModels.userEntity".
    createUserUseCaseResultDto = userModels.userEntity;

    // OK - Redeclaration of an internal type. Could be useful for typing coherence.
    // "createUserUseCaseDtoV2" becomes an alias of "createUserUseCaseDto".
    createUserUseCaseDtoV2 = this.createUserUseCaseDto;

    // NOK - Redeclaration of an alias. It will be an alias of "userModels.userEntity"
    // because "createUserUseCaseResultDto" is aliased during runtime.
    createUserUseCaseResultDtoV2 = this.createUserUseCaseResultDto;

    // OK, but avoid it - Redeclaration of an alias. It will wait until
    // "createUserUseCaseResultDto" is aliased and then will becosa an alias
    // of "createUserUseCaseResultDto"
    createUserUseCaseResultDtoV3 = z.lazy(() => this.createUserUseCaseResultDto),
}
```