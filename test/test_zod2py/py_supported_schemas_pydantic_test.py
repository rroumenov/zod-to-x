#!/usr/bin/env python3
"""
Test pydantic serialization/deserialization.
"""

import sys
sys.path.insert(0, ".")
sys.path.insert(0, "class-expected")

from py_test_utils import (
    j_supported_schemas,
    j_object_item,
    j_other_object_item,
    j_object_item_with_discriminator,
    j_other_object_item_with_discriminator,
    j_intersection_item,
    j_union_item_object,
    j_union_item_other_object,
    j_discriminated_union_enum1,
    j_discriminated_union_enum2,
)

from py_supported_schemas_pydantic import (
    ObjectItem,
    OtherObjectItem,
    ObjectItemWithDiscriminator,
    OtherObjectItemWithDiscriminator,
    IntersectionItem,
    UnionItemWrapper,
    DiscriminatedUnionItemWrapper,
    PySupportedSchemas,
)


def test_roundtrip(name: str, cls, data: dict) -> bool:
    """Test dict -> Object -> dict roundtrip"""
    try:
        obj = cls.model_validate(data)
        result = obj.model_dump(mode='json', by_alias=True)
        
        # Special handling for sets (unordered)
        if data == result:
            print(f"✓ {name}")
            return True
        elif _dicts_equal_ignoring_set_order(data, result):
            print(f"✓ {name}")
            return True
        else:
            print(f"✗ {name}: roundtrip mismatch")
            print(f"  Input:  {data}")
            print(f"  Output: {result}")
            return False
    except Exception as e:
        print(f"✗ {name}: {e}")
        return False


def _dicts_equal_ignoring_set_order(d1: dict, d2: dict) -> bool:
    """Compare dicts, treating list values as sets where appropriate"""
    if set(d1.keys()) != set(d2.keys()):
        return False
    
    for key in d1.keys():
        v1, v2 = d1[key], d2[key]
        
        # If both are lists, try comparing as sets (handles Set[T] serialization)
        # Only works if elements are hashable
        if isinstance(v1, list) and isinstance(v2, list):
            try:
                if set(v1) == set(v2):
                    continue
            except TypeError:
                # Elements not hashable (nested lists/dicts), compare as-is
                pass
            if v1 != v2:
                return False
        elif isinstance(v1, dict) and isinstance(v2, dict):
            if not _dicts_equal_ignoring_set_order(v1, v2):
                return False
        elif v1 != v2:
            return False
    
    return True


def main():
    total = 0
    passed = 0

    tests = [
        ("ObjectItem", ObjectItem, j_object_item),
        ("OtherObjectItem", OtherObjectItem, j_other_object_item),
        ("ObjectItemWithDiscriminator", ObjectItemWithDiscriminator, j_object_item_with_discriminator),
        ("OtherObjectItemWithDiscriminator", OtherObjectItemWithDiscriminator, j_other_object_item_with_discriminator),
        ("IntersectionItem", IntersectionItem, j_intersection_item),
        ("UnionItem (Object)", UnionItemWrapper, {"data": j_union_item_object}),
        ("UnionItem (OtherObject)", UnionItemWrapper, {"data": j_union_item_other_object}),
        ("DiscriminatedUnion (Enum1)", DiscriminatedUnionItemWrapper, {"data": j_discriminated_union_enum1}),
        ("DiscriminatedUnion (Enum2)", DiscriminatedUnionItemWrapper, {"data": j_discriminated_union_enum2}),
        ("PySupportedSchemas", PySupportedSchemas, j_supported_schemas),
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
