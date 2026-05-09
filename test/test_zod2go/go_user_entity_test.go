package models

import "testing"

// User domain entity roundtrip.
func TestUserModels_Roundtrip(t *testing.T) {
	testSerialization(t, "User Models", jUserModels, &UserModels{})
}

func TestUserEntity_Roundtrip(t *testing.T) {
	testSerialization(t, "User Entity", jUserEntity, &UserEntity{})
}
