package models

import "testing"

// Tests time.Time marshalling and embedded struct field promotion.
func TestUserDtos_Roundtrip(t *testing.T) {
	testSerialization(t, "User DTOs", jUserDtos, &UserDtos{})
}
