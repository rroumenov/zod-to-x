package models

import "testing"

// Flat (non-layered) schema roundtrip.
func TestGoSupportedSchemas_Roundtrip(t *testing.T) {
	testSerialization(t, "Go Supported Schemas", jSupportedSchemas, &GoSupportedSchemas{})
}
