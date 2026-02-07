#!/usr/bin/env python3
"""
Test pydantic serialization/deserialization for layered generics.
"""

import sys
sys.path.insert(0, './class-expected')

from py_test_utils import j_generic_user_entities, j_infrastructure_types

import layered_generics_app as GENERICS_APP
import layered_generics_infra as GENERICS_INFRA


def test_roundtrip(name: str, cls, data: dict) -> bool:
    """Test dict -> Object -> dict roundtrip"""
    try:
        obj = cls.model_validate(data)
        result = obj.model_dump(mode='json', by_alias=True)
        
        if data == result:
            print(f"✓ {name}")
            return True
        else:
            print(f"✗ {name}: roundtrip mismatch")
            print(f"  Input:  {data}")
            print(f"  Output: {result}")
            return False
    except Exception as e:
        print(f"✗ {name}: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    total = 0
    passed = 0

    tests = [
        # Application layer generics
        ("NormalUserEntity", GENERICS_APP.NormalUserEntity, j_generic_user_entities["normalUserEntity"]),
        ("AdminUserEntity", GENERICS_APP.AdminUserEntity, j_generic_user_entities["adminUserEntity"]),
        ("NormalUserMetadata", GENERICS_APP.NormalUserMetadata, j_generic_user_entities["normalUserEntity"]["metadata"]),
        ("AdminUserMetadata", GENERICS_APP.AdminUserMetadata, j_generic_user_entities["adminUserEntity"]["metadata"]),
        
        # Infrastructure layer types
        ("SomeDtoResult", GENERICS_INFRA.SomeDtoResult, j_infrastructure_types["httpSuccessfulResponse"]["data"]),
        ("OtherDtoResult", GENERICS_INFRA.OtherDtoResult, j_infrastructure_types["intersectedDataRetrieve"]["metadata"]),
        ("HttpUnsuccessfulResponse", GENERICS_INFRA.HttpUnsuccessfulResponse, j_infrastructure_types["httpUnsuccessfulResponse"]),
        ("HttpErrorResponse", GENERICS_INFRA.HttpErrorResponse, {"message": "Test error message"}),
        ("HttpSuccessfulResponse[SomeDtoResult]", GENERICS_INFRA.HttpSuccessfulResponse[GENERICS_INFRA.SomeDtoResult], j_infrastructure_types["httpSuccessfulResponse"]),
        
        # Generic instantiations
        ("GenericUserEntity[NormalUserMetadata]", GENERICS_APP.GenericUserEntity[GENERICS_APP.NormalUserMetadata], j_generic_user_entities["normalUserEntity"]),
        ("GenericUserEntity[SomeDtoResult]", GENERICS_APP.GenericUserEntity[GENERICS_INFRA.SomeDtoResult], j_infrastructure_types["objectWithGeneric"]["userItem"]),
        
        # Class inheritance of generics
        ("InternalObjectWithGeneric", GENERICS_INFRA.InternalObjectWithGeneric, j_infrastructure_types["objectWithGeneric"]["internal"]),
        ("DataRetrieve", GENERICS_INFRA.DataRetrieve, j_infrastructure_types["dataRetrieve"]),
        
        # Complex objects with generics
        ("ObjectWithGeneric", GENERICS_INFRA.ObjectWithGeneric, j_infrastructure_types["objectWithGeneric"]),
        
        # Generic intersections
        ("IntersectedDataRetrieve", GENERICS_INFRA.IntersectedDataRetrieve, j_infrastructure_types["intersectedDataRetrieve"]),
        
        # UserRetrieve
        ("UserRetrieve", GENERICS_INFRA.UserRetrieve, j_infrastructure_types["userRetrieve"]),
    ]

    for name, cls, data in tests:
        if test_roundtrip(name, cls, data):
            passed += 1
        total += 1

    print("-----------------------------------------")
    print(f"{'✓' if passed == total else '✗'} ({passed}/{total})")
    return 0 if passed == total else 1


if __name__ == "__main__":
    sys.exit(main())
