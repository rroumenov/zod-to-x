#!/usr/bin/env python3
"""
Python Layered Test - equivalent to cpp_layered_class.test.cpp
Tests layered modeling with type aliases to ensure they resolve correctly.
"""

import sys
sys.path.insert(0, './class-expected')

from py_supported_schemas_entity import PySupportedSchemas
from py_supported_schemas_app import PySupportedSchemasApplication
from py_test_utils import j_supported_schemas_layered_entity, j_supported_schemas_layered_application


def test_type_serialization_pydantic(test_name: str, type_name: str, data: dict, cls, verbose: bool = False) -> bool:
    """
    Test serialization and deserialization using Pydantic.
    """
    result = False

    try:
        # Deserialize from dict using Pydantic
        deserialized = cls.model_validate(data)

        # Serialize back to dict using Pydantic
        serialized = deserialized.model_dump(mode='json', by_alias=True)

        if verbose:
            print(f"{type_name} - Serialized: {serialized}")

        # Handle set comparison (sets are unordered)
        def dicts_equal_ignoring_set_order(d1, d2):
            if d1.keys() != d2.keys():
                return False
            for key in d1:
                v1, v2 = d1[key], d2[key]
                if isinstance(v1, list) and isinstance(v2, list):
                    # Check if it's a set (list of hashable items)
                    try:
                        if set(v1) == set(v2):
                            continue
                    except TypeError:
                        pass
                if v1 != v2:
                    return False
            return True

        if dicts_equal_ignoring_set_order(data, serialized):
            print(f"✓ Test passed: {test_name} - {type_name}")
            result = True
        else:
            print(f"✗ Test failed: {test_name} - {type_name}")
            print(f"  Expected: {data}")
            print(f"  Got:      {serialized}")

    except Exception as e:
        print(f"✗ Test error: {test_name} - {type_name} - Exception: {e}")
        import traceback
        traceback.print_exc()

    return result


def main():
    test_name = "Python - Layered Class"
    total_tests = 0
    passed_tests = 0

    print(f"\n{'='*60}")
    print(f"Running: {test_name}")
    print(f"{'='*60}\n")

    # Test entity layer
    if test_type_serialization_pydantic(
        test_name,
        "PySupportedSchemas",
        j_supported_schemas_layered_entity,
        PySupportedSchemas,
        False
    ):
        passed_tests += 1
    total_tests += 1

    # Test application layer (with type aliases)
    if test_type_serialization_pydantic(
        test_name,
        "PySupportedSchemasApplication",
        j_supported_schemas_layered_application,
        PySupportedSchemasApplication,
        False
    ):
        passed_tests += 1
    total_tests += 1

    print(f"\n{'-'*60}")
    status = "✓" if passed_tests == total_tests else "✗"
    print(f"{status} ({passed_tests}/{total_tests})")
    print(f"{'-'*60}\n")

    return 0 if passed_tests == total_tests else 1


if __name__ == "__main__":
    sys.exit(main())
