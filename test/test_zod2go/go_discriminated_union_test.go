package models

import (
	"testing"
)

// TestDiscriminatedUnionItem_Dispatch_Enum1 verifies that UnmarshalDiscriminatedUnionItem
// returns an ObjectItemWithDiscriminator when discriminator is "Enum1".
func TestDiscriminatedUnionItem_Dispatch_Enum1(t *testing.T) {
	result, err := UnmarshalDiscriminatedUnionItem(jObjectItemWithDiscriminator)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	v, ok := result.(ObjectItemWithDiscriminator)
	if !ok {
		t.Fatalf("expected ObjectItemWithDiscriminator, got %T", result)
	}
	if v.Key != "testKey" {
		t.Errorf("expected Key=%q, got %q", "testKey", v.Key)
	}
	if v.Discriminator != EnumItemEnum1 {
		t.Errorf("expected Discriminator=%q, got %q", EnumItemEnum1, v.Discriminator)
	}
}

// TestDiscriminatedUnionItem_Dispatch_Enum2 verifies that UnmarshalDiscriminatedUnionItem
// returns an OtherObjectItemWithDiscriminator when discriminator is "Enum2".
func TestDiscriminatedUnionItem_Dispatch_Enum2(t *testing.T) {
	result, err := UnmarshalDiscriminatedUnionItem(jOtherObjectItemWithDiscriminator)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	v, ok := result.(OtherObjectItemWithDiscriminator)
	if !ok {
		t.Fatalf("expected OtherObjectItemWithDiscriminator, got %T", result)
	}
	if v.OtherKey != "testOtherKey" {
		t.Errorf("expected OtherKey=%q, got %q", "testOtherKey", v.OtherKey)
	}
	if v.Discriminator != EnumItemEnum2 {
		t.Errorf("expected Discriminator=%q, got %q", EnumItemEnum2, v.Discriminator)
	}
}

// TestDiscriminatedUnionItem_Dispatch_Unknown verifies that UnmarshalDiscriminatedUnionItem
// returns an error when the discriminator value is not recognized.
func TestDiscriminatedUnionItem_Dispatch_Unknown(t *testing.T) {
	data := []byte(`{"discriminator": "Unknown"}`)
	_, err := UnmarshalDiscriminatedUnionItem(data)
	if err == nil {
		t.Fatal("expected error for unknown discriminator, got nil")
	}
}
