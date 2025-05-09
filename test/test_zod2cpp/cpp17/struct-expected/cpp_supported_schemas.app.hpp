// This is
// a multiline
// header.

#pragma once

#include "cpp_supported_schemas.entity.hpp"
#include <cstdint>
#include <nlohmann/json.hpp>
#include <optional>
#include <string>

using nlohmann::json;

namespace CPP_SUPPORTED_SCHEMAS_APP {
    using NewStringItem = CPP_SUPPORTED_SCHEMAS::StringItem;

    using NewEnumItem = CPP_SUPPORTED_SCHEMAS::EnumItem;

    using NewNativeEnumItem = CPP_SUPPORTED_SCHEMAS::NativeEnumItem;

    using NewDoubleItem = CPP_SUPPORTED_SCHEMAS::DoubleItem;

    using NewBigIntItem = CPP_SUPPORTED_SCHEMAS::BigIntItem;

    using NewInt64Item = CPP_SUPPORTED_SCHEMAS::Int64Item;

    using NewInt32Item = CPP_SUPPORTED_SCHEMAS::Int32Item;

    using NewBooleanItem = CPP_SUPPORTED_SCHEMAS::BooleanItem;

    struct NewObjectItem : public CPP_SUPPORTED_SCHEMAS::ObjectItem {};

    using NewArrayItem = CPP_SUPPORTED_SCHEMAS::ArrayItem;

    using NewRecordItem = CPP_SUPPORTED_SCHEMAS::RecordItem;

    using NewMapItem = CPP_SUPPORTED_SCHEMAS::MapItem;

    using NewSetItem = CPP_SUPPORTED_SCHEMAS::SetItem;

    using NewTupleItem = CPP_SUPPORTED_SCHEMAS::TupleItem;

    using NewUnionItem = CPP_SUPPORTED_SCHEMAS::UnionItem;

    using NewDiscriminatedUnionItem = CPP_SUPPORTED_SCHEMAS::DiscriminatedUnionItem;

    struct NewIntersectionItem : public CPP_SUPPORTED_SCHEMAS::IntersectionItem {};

    using NewAnyItem = CPP_SUPPORTED_SCHEMAS::AnyItem;

    struct CppSupportedSchemasApplication {
        NewStringItem new_string_item;
        std::string new_literal_string_item;
        std::uint32_t new_literal_number_item;
        NewEnumItem new_enum_item;
        NewNativeEnumItem new_native_enum_item;
        NewDoubleItem new_double_item;
        NewBigIntItem new_big_int_item;
        NewInt64Item new_int64_item;
        NewInt32Item new_int32_item;
        NewBooleanItem new_boolean_item;
        NewObjectItem new_object_item;
        NewArrayItem new_array_item;
        NewRecordItem new_record_item;
        NewMapItem new_map_item;
        NewSetItem new_set_item;
        NewTupleItem new_tuple_item;
        NewUnionItem new_union_item;
        NewDiscriminatedUnionItem new_discriminated_union_item;
        NewIntersectionItem new_intersection_item;
        NewAnyItem new_any_item;
        std::optional<std::string> new_optional_item;
        std::optional<std::string> new_nullable_item;
    };

}

namespace CPP_SUPPORTED_SCHEMAS_APP {
    #ifndef NLOHMANN_OPTIONAL_HELPER_CPP_SUPPORTED_SCHEMAS_APP
    #define NLOHMANN_OPTIONAL_HELPER_CPP_SUPPORTED_SCHEMAS_APP
    template <typename T>
    std::optional<T> get_opt(const json& j, const std::string& key) {
        auto it = j.find(key);
        if (it != j.end() && !it->is_null()) {
            return it->get<T>();
        }
        return std::optional<T>();
    }

    template <typename T>
    void set_opt(json& j, const std::string& key, const std::optional<T>& opt) {
        if (opt) {
            j[key] = *opt;
        }
        else {
            j[key] = nullptr;
        }
    }
    #endif

    inline void to_json(json& j, const CppSupportedSchemasApplication& x) {
        j["newStringItem"] = x.new_string_item;
        j["newLiteralStringItem"] = x.new_literal_string_item;
        j["newLiteralNumberItem"] = x.new_literal_number_item;
        j["newEnumItem"] = x.new_enum_item;
        j["newNativeEnumItem"] = x.new_native_enum_item;
        j["newDoubleItem"] = x.new_double_item;
        j["newBigIntItem"] = x.new_big_int_item;
        j["newInt64Item"] = x.new_int64_item;
        j["newInt32Item"] = x.new_int32_item;
        j["newBooleanItem"] = x.new_boolean_item;
        j["newObjectItem"] = x.new_object_item;
        j["newArrayItem"] = x.new_array_item;
        j["newRecordItem"] = x.new_record_item;
        j["newMapItem"] = x.new_map_item;
        j["newSetItem"] = x.new_set_item;
        j["newTupleItem"] = x.new_tuple_item;
        j["newUnionItem"] = x.new_union_item;
        j["newDiscriminatedUnionItem"] = x.new_discriminated_union_item;
        j["newIntersectionItem"] = x.new_intersection_item;
        j["newAnyItem"] = x.new_any_item;
        set_opt<std::string>(j, "newOptionalItem", x.new_optional_item);
        set_opt<std::string>(j, "newNullableItem", x.new_nullable_item);
    }

    inline void from_json(const json& j, CppSupportedSchemasApplication& x) {
        x.new_string_item = j.at("newStringItem").get<NewStringItem>();
        x.new_literal_string_item = j.at("newLiteralStringItem").get<std::string>();
        x.new_literal_number_item = j.at("newLiteralNumberItem").get<std::uint32_t>();
        x.new_enum_item = j.at("newEnumItem").get<NewEnumItem>();
        x.new_native_enum_item = j.at("newNativeEnumItem").get<NewNativeEnumItem>();
        x.new_double_item = j.at("newDoubleItem").get<NewDoubleItem>();
        x.new_big_int_item = j.at("newBigIntItem").get<NewBigIntItem>();
        x.new_int64_item = j.at("newInt64Item").get<NewInt64Item>();
        x.new_int32_item = j.at("newInt32Item").get<NewInt32Item>();
        x.new_boolean_item = j.at("newBooleanItem").get<NewBooleanItem>();
        x.new_object_item = j.at("newObjectItem").get<NewObjectItem>();
        x.new_array_item = j.at("newArrayItem").get<NewArrayItem>();
        x.new_record_item = j.at("newRecordItem").get<NewRecordItem>();
        x.new_map_item = j.at("newMapItem").get<NewMapItem>();
        x.new_set_item = j.at("newSetItem").get<NewSetItem>();
        x.new_tuple_item = j.at("newTupleItem").get<NewTupleItem>();
        x.new_union_item = j.at("newUnionItem").get<NewUnionItem>();
        x.new_discriminated_union_item = j.at("newDiscriminatedUnionItem").get<NewDiscriminatedUnionItem>();
        x.new_intersection_item = j.at("newIntersectionItem").get<NewIntersectionItem>();
        x.new_any_item = j.at("newAnyItem").get<NewAnyItem>();
        x.new_optional_item = get_opt<std::string>(j, "newOptionalItem");
        x.new_nullable_item = get_opt<std::string>(j, "newNullableItem");
    }

}