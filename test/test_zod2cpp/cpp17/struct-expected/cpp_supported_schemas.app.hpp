// This is
// a multiline
// header.

#pragma once

#include "cpp_supported_schemas.entity.hpp"
#include <cstdint>
#include <nlohmann/json.hpp>
#include <optional>
#include <set>
#include <string>
#include <tuple>
#include <unordered_map>
#include <vector>

using nlohmann::json;

namespace CPP_SUPPORTED_SCHEMAS_APP {
    struct NewObjectItem : public CPP_SUPPORTED_SCHEMAS::ObjectItem {};

    using NewUnionItem = CPP_SUPPORTED_SCHEMAS::UnionItem;

    using NewDiscriminatedUnionItem = CPP_SUPPORTED_SCHEMAS::DiscriminatedUnionItem;

    struct NewIntersectionItem : public CPP_SUPPORTED_SCHEMAS::IntersectionItem {};

    struct CppSupportedSchemasApplication {
        std::string new_string_item;
        std::string new_literal_string_item;
        std::uint32_t new_literal_number_item;
        CPP_SUPPORTED_SCHEMAS::EnumItem new_enum_item;
        CPP_SUPPORTED_SCHEMAS::NativeEnumItem new_native_enum_item;
        double new_double_item;
        std::int64_t new_big_int_item;
        std::int64_t new_int64_item;
        std::int32_t new_int32_item;
        bool new_boolean_item;
        NewObjectItem new_object_item;
        std::vector<std::vector<double>> new_array_item;
        std::unordered_map<std::string, double> new_record_item;
        std::unordered_map<std::string, double> new_map_item;
        std::set<std::string> new_set_item;
        std::tuple<double, std::string, bool> new_tuple_item;
        NewUnionItem new_union_item;
        NewDiscriminatedUnionItem new_discriminated_union_item;
        NewIntersectionItem new_intersection_item;
        json new_any_item;
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
        x.new_string_item = j.at("newStringItem").get<std::string>();
        x.new_literal_string_item = j.at("newLiteralStringItem").get<std::string>();
        x.new_literal_number_item = j.at("newLiteralNumberItem").get<std::uint32_t>();
        x.new_enum_item = j.at("newEnumItem").get<CPP_SUPPORTED_SCHEMAS::EnumItem>();
        x.new_native_enum_item = j.at("newNativeEnumItem").get<CPP_SUPPORTED_SCHEMAS::NativeEnumItem>();
        x.new_double_item = j.at("newDoubleItem").get<double>();
        x.new_big_int_item = j.at("newBigIntItem").get<std::int64_t>();
        x.new_int64_item = j.at("newInt64Item").get<std::int64_t>();
        x.new_int32_item = j.at("newInt32Item").get<std::int32_t>();
        x.new_boolean_item = j.at("newBooleanItem").get<bool>();
        x.new_object_item = j.at("newObjectItem").get<NewObjectItem>();
        x.new_array_item = j.at("newArrayItem").get<std::vector<std::vector<double>>>();
        x.new_record_item = j.at("newRecordItem").get<std::unordered_map<std::string, double>>();
        x.new_map_item = j.at("newMapItem").get<std::unordered_map<std::string, double>>();
        x.new_set_item = j.at("newSetItem").get<std::set<std::string>>();
        x.new_tuple_item = j.at("newTupleItem").get<std::tuple<double, std::string, bool>>();
        x.new_union_item = j.at("newUnionItem").get<NewUnionItem>();
        x.new_discriminated_union_item = j.at("newDiscriminatedUnionItem").get<NewDiscriminatedUnionItem>();
        x.new_intersection_item = j.at("newIntersectionItem").get<NewIntersectionItem>();
        x.new_any_item = j.at("newAnyItem").get<json>();
        x.new_optional_item = get_opt<std::string>(j, "newOptionalItem");
        x.new_nullable_item = get_opt<std::string>(j, "newNullableItem");
    }

}