package models

import "testing"

// Layered application schema roundtrip.
func TestGoSupportedSchemasApplication_Roundtrip(t *testing.T) {
	testSerialization(t, "Go Supported Schemas (Layered Application)", jSupportedSchemasLayeredApplication, &GoSupportedSchemasApplication{})
}
