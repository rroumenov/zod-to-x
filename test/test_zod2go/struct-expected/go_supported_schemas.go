// This is
// a multiline
// header.

package models

import (
	"encoding/json"
	"fmt"
	"time"
)

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

// An object
type ObjectItem struct {
    Key string `json:"key"`
}

// Another object
type OtherObjectItem struct {
    OtherKey string `json:"otherKey"`
}

// A union of two objects
// UnionItem is a union of: ObjectItem, OtherObjectItem
type UnionItem = any

// An object with a discriminator
type ObjectItemWithDiscriminator struct {
    Key string `json:"key"`
    Discriminator EnumItem `json:"discriminator"`
}

// Another object with a discriminator
type OtherObjectItemWithDiscriminator struct {
    OtherKey string `json:"otherKey"`
    Discriminator EnumItem `json:"discriminator"`
}

// A discriminated union of two objects
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

// An intersection of two objects
type IntersectionItem struct {
    Key string `json:"key"`
    OtherKey string `json:"otherKey"`
}

type GoSupportedSchemas struct {

    // A simple string
    StringItem string `json:"stringItem"`

    // A literal string
    LiteralStringItem string `json:"literalStringItem"`

    // A literal number
    LiteralNumberItem int64 `json:"literalNumberItem"`
    EnumItem EnumItem `json:"enumItem"`
    NativeEnumItem NativeEnumItem `json:"nativeEnumItem"`

    // A double
    DoubleItem float64 `json:"doubleItem"`

    // A big integer
    BigIntItem int64 `json:"bigIntItem"`

    // A 64-bit integer
    Int64Item int64 `json:"int64Item"`

    // A 32-bit integer
    Int32Item int32 `json:"int32Item"`

    // A boolean
    BooleanItem bool `json:"booleanItem"`
    ObjectItem ObjectItem `json:"objectItem"`

    // A date
    DateItem time.Time `json:"dateItem"`

    // A two-dimensional array of numbers
    ArrayItem [][]float64 `json:"arrayItem"`

    // A record with string keys and number values
    RecordItem map[string]float64 `json:"recordItem"`

    // A map with string keys and number values
    MapItem map[string]float64 `json:"mapItem"`

    // A set of strings
    SetItem map[string]struct{} `json:"setItem"`

    // A tuple of a number, a string, and a boolean
    TupleItem []any `json:"tupleItem"`
    UnionItem UnionItem `json:"unionItem"`
    DiscriminatedUnionItem DiscriminatedUnionItem `json:"discriminatedUnionItem"`
    IntersectionItem IntersectionItem `json:"intersectionItem"`

    // Any type
    AnyItem any `json:"anyItem"`

    // An optional string
    OptionalItem *string `json:"optionalItem,omitempty"`

    // A nullable string
    NullableItem *string `json:"nullableItem,omitempty"`
}
