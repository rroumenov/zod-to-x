package models

import "testing"

// Tests []T array fields and embedded cross-layer types.
func TestUserApi_Roundtrip(t *testing.T) {
	testSerialization(t, "User API", jUserApi, &UserApi{})
}
