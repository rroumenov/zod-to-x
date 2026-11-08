# zod-to-x

## 1.9.0

### Minor Changes

- detect circular layer imports and same-layer ownership ties (#19)
- use the local alias of a model for references to the types it redeclares
- ast and layered reliability (#17)

### Patch Changes

- find copies of user schemas by structure instead of patching Zod
- discriminants of generic instances in discriminated unions
- Dart unions of types of other files and templates of generic types
- Go unions of types of other packages and struct fields of unions
- import Literal in Python output for literals linked to enums (#26)
- C++ unions of types of another namespace
- rebuild layered ASTs when models change and cache their imports
