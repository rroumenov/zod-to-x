package models

import (
	"testing"
	GENERICS_APP "generics_app"
)

// Application-package generic types
func TestNormalUserEntity_Roundtrip(t *testing.T) {
	testSerialization(t, "NormalUserEntity", jNormalUserEntity, &GENERICS_APP.NormalUserEntity{})
}

func TestAdminUserEntity_Roundtrip(t *testing.T) {
	testSerialization(t, "AdminUserEntity", jAdminUserEntity, &GENERICS_APP.AdminUserEntity{})
}

func TestNormalUserMetadata_Roundtrip(t *testing.T) {
	testSerialization(t, "NormalUserMetadata", jNormalUserMetadata, &GENERICS_APP.NormalUserMetadata{})
}

func TestAdminUserMetadata_Roundtrip(t *testing.T) {
	testSerialization(t, "AdminUserMetadata", jAdminUserMetadata, &GENERICS_APP.AdminUserMetadata{})
}

// Infrastructure-package concrete types
func TestSomeDtoResult_Roundtrip(t *testing.T) {
	testSerialization(t, "SomeDtoResult", jSomeDtoResult, &SomeDtoResult{})
}

func TestOtherDtoResult_Roundtrip(t *testing.T) {
	testSerialization(t, "OtherDtoResult", jOtherDtoResult, &OtherDtoResult{})
}

func TestHttpUnsuccessfulResponse_Roundtrip(t *testing.T) {
	testSerialization(t, "HttpUnsuccessfulResponse", jHttpUnsuccessfulResponse, &HttpUnsuccessfulResponse{})
}

func TestHttpErrorResponse_Roundtrip(t *testing.T) {
	testSerialization(t, "HttpErrorResponse", jHttpErrorResponse, &HttpErrorResponse{})
}

// Generic instantiations (Go 1.18+ generics)
func TestHttpSuccessfulResponse_WithSomeDtoResult_Roundtrip(t *testing.T) {
	testSerialization(t, "HttpSuccessfulResponse[SomeDtoResult]", jHttpSuccessfulResponseSomeDto, &HttpSuccessfulResponse[SomeDtoResult]{})
}

func TestGenericUserEntity_WithNormalMetadata_Roundtrip(t *testing.T) {
	testSerialization(t, "GenericUserEntity[NormalUserMetadata]", jNormalUserEntity, &GENERICS_APP.GenericUserEntity[GENERICS_APP.NormalUserMetadata]{})
}

func TestGenericUserEntity_WithSomeDtoResult_Roundtrip(t *testing.T) {
	testSerialization(t, "GenericUserEntity[SomeDtoResult]", jGenericUserEntitySomeDto, &GENERICS_APP.GenericUserEntity[SomeDtoResult]{})
}

func TestInternalObjectWithGeneric_Roundtrip(t *testing.T) {
	testSerialization(t, "InternalObjectWithGeneric", jInternalObjectWithGeneric, &InternalObjectWithGeneric{})
}

func TestDataRetrieve_Roundtrip(t *testing.T) {
	testSerialization(t, "DataRetrieve", jDataRetrieve, &DataRetrieve{})
}

func TestUserRetrieve_Roundtrip(t *testing.T) {
	testSerialization(t, "UserRetrieve", jUserRetrieve, &UserRetrieve{})
}

func TestObjectWithGeneric_Roundtrip(t *testing.T) {
	testSerialization(t, "ObjectWithGeneric", jObjectWithGeneric, &ObjectWithGeneric{})
}

func TestIntersectedDataRetrieve_Roundtrip(t *testing.T) {
	testSerialization(t, "IntersectedDataRetrieve", jIntersectedDataRetrieve, &IntersectedDataRetrieve{})
}

// UserEntities = any — validates compilation; any accepts any JSON value.
func TestUserEntities_Normal_Roundtrip(t *testing.T) {
	var v GENERICS_APP.UserEntities
	testSerialization(t, "UserEntities (normal)", jNormalUserEntity, &v)
}

func TestUserEntities_Admin_Roundtrip(t *testing.T) {
	var v GENERICS_APP.UserEntities
	testSerialization(t, "UserEntities (admin)", jAdminUserEntity, &v)
}
// Discriminant union dispatch tests
func TestDiscriminantDataRetrieve_Dispatch_Successful(t *testing.T) {
        result, err := UnmarshalDiscriminantDataRetrieve(jHttpSuccessfulResponseSomeDto)
        if err != nil {
                t.Fatalf("unexpected error: %v", err)
        }
        v, ok := result.(HttpSuccessfulResponse[SomeDtoResult])
        if !ok {
                t.Fatalf("expected HttpSuccessfulResponse[SomeDtoResult], got %T", result)
        }
        if !v.Success {
                t.Errorf("expected Success=true, got false")
        }
        if v.Data.Id != "dto_001" {
                t.Errorf("expected Data.Id=%q, got %q", "dto_001", v.Data.Id)
        }
}

func TestDiscriminantDataRetrieve_Dispatch_Unsuccessful(t *testing.T) {
        result, err := UnmarshalDiscriminantDataRetrieve(jHttpUnsuccessfulResponse)
        if err != nil {
                t.Fatalf("unexpected error: %v", err)
        }
        v, ok := result.(HttpUnsuccessfulResponse)
        if !ok {
                t.Fatalf("expected HttpUnsuccessfulResponse, got %T", result)
        }
        if v.Success {
                t.Errorf("expected Success=false, got true")
        }
        if v.Message != "Operation failed" {
                t.Errorf("expected Message=%q, got %q", "Operation failed", v.Message)
        }
}