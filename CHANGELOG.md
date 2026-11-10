# zod-to-x

## 2.7.1

### Patch Changes

- remove the blank line before member comments
- keep the types referenced by layered models instead of their local aliases
- keep the descriptions set on layered aliases and object members

## 2.7.0

### Minor Changes

- detect circular layer imports and same-layer ownership ties (#18)
- use the local alias of a model for references to the types it redeclares (#23)
- JSON Schema definitions from zod2x type names with native toJSONSchema (#30)

### Patch Changes

- keep type names of object copies and replace deprecated generic marker (#20)
- rebuild layered ASTs when models change and cache their imports (#21)
- find object copies by structure instead of wrapping the clone method of user schemas (#24)
- Dart unions of types of other files and templates of generic types
- discriminants of generic instances in discriminated unions
- Go unions of types of other packages and struct fields of unions
- C++ unions of types of another namespace
- import Literal in Python output for literals linked to enums (#27)

## 2.6.0

### Minor Changes

- allow default types for generic templates (#13)

## 2.5.0

### Minor Changes

- ast and layered reliability (#9)
