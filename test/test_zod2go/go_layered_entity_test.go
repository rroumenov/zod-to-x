package models

import "testing"

// Layered entity schema roundtrip.
func TestGoSupportedSchemasEntity_Roundtrip(t *testing.T) {
	testSerialization(t, "Go Supported Schemas (Layered Entity)", jSupportedSchemasLayeredEntity, &GoSupportedSchemas{})
}
