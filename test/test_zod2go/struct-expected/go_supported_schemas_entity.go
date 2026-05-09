package models

import (
	"encoding/json"
	"fmt"
	"time"
)

// A simple string
type StringItem = string

// An enum
type EnumItem string

const (
    EnumItemEnum1 EnumItem = "Enum1"
    EnumItemEnum2 EnumItem = "Enum2"
    EnumItemEnum3 EnumItem = "Enum3"
)

// A native enum
type NativeEnumItem = any

// NativeEnumItem: mixed-type enum — no single Go base type available
const (
    NativeEnumItemNativeEnum1 = 1
    NativeEnumItemNativeEnum2 = 2
    NativeEnumItemNativeEnum3 = "NativeEnum3"
)

// A double
type DoubleItem = float64

// A big integer
type BigIntItem = int64

// A 64-bit integer
type Int64Item = int64

// A 32-bit integer
type Int32Item = int32

// A boolean
type BooleanItem = bool

// An object
type ObjectItem struct {
    Key string `json:"key"`
}

// Other Object Item
type OtherObjectItem struct {
    OtherKey string `json:"otherKey"`
}

// Object Item With Discriminator
type ObjectItemWithDiscriminator struct {
    Key string `json:"key"`
    Discriminator EnumItem `json:"discriminator"`
}

// Other Object Item With Discriminator
type OtherObjectItemWithDiscriminator struct {
    OtherKey string `json:"otherKey"`
    Discriminator EnumItem `json:"discriminator"`
}

// A date
type DateItem = time.Time

// A two-dimensional array of numbers
type ArrayItem = [][]float64

// A record with string keys and number values
type RecordItem = map[string]float64

// A map with string keys and number values
type MapItem = map[string]float64

// A set of strings
type SetItem = map[string]struct{}

// A tuple of a number, a string, and a boolean
type TupleItem = []any

// Union Item
// UnionItem is a union of: ObjectItem, OtherObjectItem
type UnionItem = any

// Discriminated Union Item
// DiscriminatedUnionItem is a discriminated union on "discriminator".
// Possible types: ObjectItemWithDiscriminator, OtherObjectItemWithDiscriminator
type DiscriminatedUnionItem interface {
    isDiscriminatedUnionItem()
}

func (t ObjectItemWithDiscriminator) isDiscriminatedUnionItem() {}

func (t OtherObjectItemWithDiscriminator) isDiscriminatedUnionItem() {}

// UnmarshalDiscriminatedUnionItem deserializes JSON into the correct DiscriminatedUnionItem concrete type
// by probing the "discriminator" discriminant field.
func UnmarshalDiscriminatedUnionItem(data []byte) (DiscriminatedUnionItem, error) {
    var probe struct {
        Discriminator json.RawMessage `json:"discriminator"`
    }
    if err := json.Unmarshal(data, &probe); err != nil {
        return nil, err
    }
    switch string(probe.Discriminator) {
    case `"Enum1"`:
        var v ObjectItemWithDiscriminator
        if err := json.Unmarshal(data, &v); err != nil {
            return nil, err
        }
        return v, nil
    case `"Enum2"`:
        var v OtherObjectItemWithDiscriminator
        if err := json.Unmarshal(data, &v); err != nil {
            return nil, err
        }
        return v, nil
    }
    return nil, fmt.Errorf("failed to deserialize DiscriminatedUnionItem: unknown discriminator %s", string(probe.Discriminator))
}

// Intersection Item
type IntersectionItem struct {
    Key string `json:"key"`
    OtherKey string `json:"otherKey"`
}

// Any type
type AnyItem = any

type GoSupportedSchemas struct {
    StringItem StringItem `json:"stringItem"`

    // A literal string
    LiteralStringItem string `json:"literalStringItem"`

    // A literal number
    LiteralNumberItem int64 `json:"literalNumberItem"`
    EnumItem EnumItem `json:"enumItem"`
    NativeEnumItem NativeEnumItem `json:"nativeEnumItem"`
    DoubleItem DoubleItem `json:"doubleItem"`
    BigIntItem BigIntItem `json:"bigIntItem"`
    Int64Item Int64Item `json:"int64Item"`
    Int32Item Int32Item `json:"int32Item"`
    BooleanItem BooleanItem `json:"booleanItem"`
    ObjectItem ObjectItem `json:"objectItem"`
    OtherObjectItem OtherObjectItem `json:"otherObjectItem"`
    ObjectItemWithDiscriminator ObjectItemWithDiscriminator `json:"objectItemWithDiscriminator"`
    OtherObjectItemWithDiscriminator OtherObjectItemWithDiscriminator `json:"otherObjectItemWithDiscriminator"`
    DateItem DateItem `json:"dateItem"`
    ArrayItem ArrayItem `json:"arrayItem"`
    RecordItem RecordItem `json:"recordItem"`
    MapItem MapItem `json:"mapItem"`
    SetItem SetItem `json:"setItem"`
    TupleItem TupleItem `json:"tupleItem"`
    UnionItem UnionItem `json:"unionItem"`
    DiscriminatedUnionItem DiscriminatedUnionItem `json:"discriminatedUnionItem"`
    IntersectionItem IntersectionItem `json:"intersectionItem"`
    AnyItem AnyItem `json:"anyItem"`

    // An optional string
    OptionalItem *string `json:"optionalItem,omitempty"`

    // A nullable string
    NullableItem *string `json:"nullableItem,omitempty"`
}
