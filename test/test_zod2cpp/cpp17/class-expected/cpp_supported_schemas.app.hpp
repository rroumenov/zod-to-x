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

using nlohmann::json;

namespace CPP_SUPPORTED_SCHEMAS_APP {
    using NewEnumItem = CPP_SUPPORTED_SCHEMAS::EnumItem;

    using NewNativeEnumItem = CPP_SUPPORTED_SCHEMAS::NativeEnumItem;

    class NewObjectItem : public CPP_SUPPORTED_SCHEMAS::ObjectItem {};

    using NewArrayItem = CPP_SUPPORTED_SCHEMAS::ArrayItem;

    using NewUnionItem = CPP_SUPPORTED_SCHEMAS::UnionItem;

    using NewDiscriminatedUnionItem = CPP_SUPPORTED_SCHEMAS::DiscriminatedUnionItem;

    class NewIntersectionItem : public CPP_SUPPORTED_SCHEMAS::IntersectionItem {};

    class CppSupportedSchemasApplication {
    private:
        std::string new_string_item;
        std::string new_literal_string_item;
        std::uint32_t new_literal_number_item;
        NewEnumItem new_enum_item;
        NewNativeEnumItem new_native_enum_item;
        double new_double_item;
        std::int64_t new_big_int_item;
        std::int64_t new_int64_item;
        std::int32_t new_int32_item;
        bool new_boolean_item;
        NewObjectItem new_object_item;
        NewArrayItem new_array_item;
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
    
    public:
        CppSupportedSchemasApplication() = default;
        virtual ~CppSupportedSchemasApplication() = default;
        
        const std::string& get_new_string_item() const { return this->new_string_item; }
        std::string& get_mut_new_string_item() { return this->new_string_item; }
        void set_new_string_item(const std::string& value) { this->new_string_item = value; }
        
        const std::string& get_new_literal_string_item() const { return this->new_literal_string_item; }
        std::string& get_mut_new_literal_string_item() { return this->new_literal_string_item; }
        void set_new_literal_string_item(const std::string& value) { this->new_literal_string_item = value; }
        
        const std::uint32_t& get_new_literal_number_item() const { return this->new_literal_number_item; }
        std::uint32_t& get_mut_new_literal_number_item() { return this->new_literal_number_item; }
        void set_new_literal_number_item(const std::uint32_t& value) { this->new_literal_number_item = value; }
        
        const NewEnumItem& get_new_enum_item() const { return this->new_enum_item; }
        NewEnumItem& get_mut_new_enum_item() { return this->new_enum_item; }
        void set_new_enum_item(const NewEnumItem& value) { this->new_enum_item = value; }
        
        const NewNativeEnumItem& get_new_native_enum_item() const { return this->new_native_enum_item; }
        NewNativeEnumItem& get_mut_new_native_enum_item() { return this->new_native_enum_item; }
        void set_new_native_enum_item(const NewNativeEnumItem& value) { this->new_native_enum_item = value; }
        
        const double& get_new_double_item() const { return this->new_double_item; }
        double& get_mut_new_double_item() { return this->new_double_item; }
        void set_new_double_item(const double& value) { this->new_double_item = value; }
        
        const std::int64_t& get_new_big_int_item() const { return this->new_big_int_item; }
        std::int64_t& get_mut_new_big_int_item() { return this->new_big_int_item; }
        void set_new_big_int_item(const std::int64_t& value) { this->new_big_int_item = value; }
        
        const std::int64_t& get_new_int64_item() const { return this->new_int64_item; }
        std::int64_t& get_mut_new_int64_item() { return this->new_int64_item; }
        void set_new_int64_item(const std::int64_t& value) { this->new_int64_item = value; }
        
        const std::int32_t& get_new_int32_item() const { return this->new_int32_item; }
        std::int32_t& get_mut_new_int32_item() { return this->new_int32_item; }
        void set_new_int32_item(const std::int32_t& value) { this->new_int32_item = value; }
        
        const bool& get_new_boolean_item() const { return this->new_boolean_item; }
        bool& get_mut_new_boolean_item() { return this->new_boolean_item; }
        void set_new_boolean_item(const bool& value) { this->new_boolean_item = value; }
        
        const NewObjectItem& get_new_object_item() const { return this->new_object_item; }
        NewObjectItem& get_mut_new_object_item() { return this->new_object_item; }
        void set_new_object_item(const NewObjectItem& value) { this->new_object_item = value; }
        
        const NewArrayItem& get_new_array_item() const { return this->new_array_item; }
        NewArrayItem& get_mut_new_array_item() { return this->new_array_item; }
        void set_new_array_item(const NewArrayItem& value) { this->new_array_item = value; }
        
        const std::unordered_map<std::string, double>& get_new_record_item() const { return this->new_record_item; }
        std::unordered_map<std::string, double>& get_mut_new_record_item() { return this->new_record_item; }
        void set_new_record_item(const std::unordered_map<std::string, double>& value) { this->new_record_item = value; }
        
        const std::unordered_map<std::string, double>& get_new_map_item() const { return this->new_map_item; }
        std::unordered_map<std::string, double>& get_mut_new_map_item() { return this->new_map_item; }
        void set_new_map_item(const std::unordered_map<std::string, double>& value) { this->new_map_item = value; }
        
        const std::set<std::string>& get_new_set_item() const { return this->new_set_item; }
        std::set<std::string>& get_mut_new_set_item() { return this->new_set_item; }
        void set_new_set_item(const std::set<std::string>& value) { this->new_set_item = value; }
        
        const std::tuple<double, std::string, bool>& get_new_tuple_item() const { return this->new_tuple_item; }
        std::tuple<double, std::string, bool>& get_mut_new_tuple_item() { return this->new_tuple_item; }
        void set_new_tuple_item(const std::tuple<double, std::string, bool>& value) { this->new_tuple_item = value; }
        
        const NewUnionItem& get_new_union_item() const { return this->new_union_item; }
        NewUnionItem& get_mut_new_union_item() { return this->new_union_item; }
        void set_new_union_item(const NewUnionItem& value) { this->new_union_item = value; }
        
        const NewDiscriminatedUnionItem& get_new_discriminated_union_item() const { return this->new_discriminated_union_item; }
        NewDiscriminatedUnionItem& get_mut_new_discriminated_union_item() { return this->new_discriminated_union_item; }
        void set_new_discriminated_union_item(const NewDiscriminatedUnionItem& value) { this->new_discriminated_union_item = value; }
        
        const NewIntersectionItem& get_new_intersection_item() const { return this->new_intersection_item; }
        NewIntersectionItem& get_mut_new_intersection_item() { return this->new_intersection_item; }
        void set_new_intersection_item(const NewIntersectionItem& value) { this->new_intersection_item = value; }
        
        const json& get_new_any_item() const { return this->new_any_item; }
        json& get_mut_new_any_item() { return this->new_any_item; }
        void set_new_any_item(const json& value) { this->new_any_item = value; }
        
        std::optional<std::string> get_new_optional_item() const { return this->new_optional_item; }
        void set_new_optional_item(std::optional<std::string> value) { this->new_optional_item = value; }
        
        std::optional<std::string> get_new_nullable_item() const { return this->new_nullable_item; }
        void set_new_nullable_item(std::optional<std::string> value) { this->new_nullable_item = value; }
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
        j["newStringItem"] = x.get_new_string_item();
        j["newLiteralStringItem"] = x.get_new_literal_string_item();
        j["newLiteralNumberItem"] = x.get_new_literal_number_item();
        j["newEnumItem"] = x.get_new_enum_item();
        j["newNativeEnumItem"] = x.get_new_native_enum_item();
        j["newDoubleItem"] = x.get_new_double_item();
        j["newBigIntItem"] = x.get_new_big_int_item();
        j["newInt64Item"] = x.get_new_int64_item();
        j["newInt32Item"] = x.get_new_int32_item();
        j["newBooleanItem"] = x.get_new_boolean_item();
        j["newObjectItem"] = x.get_new_object_item();
        j["newArrayItem"] = x.get_new_array_item();
        j["newRecordItem"] = x.get_new_record_item();
        j["newMapItem"] = x.get_new_map_item();
        j["newSetItem"] = x.get_new_set_item();
        j["newTupleItem"] = x.get_new_tuple_item();
        j["newUnionItem"] = x.get_new_union_item();
        j["newDiscriminatedUnionItem"] = x.get_new_discriminated_union_item();
        j["newIntersectionItem"] = x.get_new_intersection_item();
        j["newAnyItem"] = x.get_new_any_item();
        set_opt<std::string>(j, "newOptionalItem", x.get_new_optional_item());
        set_opt<std::string>(j, "newNullableItem", x.get_new_nullable_item());
    }

    inline void from_json(const json& j, CppSupportedSchemasApplication& x) {
        x.set_new_string_item(j.at("newStringItem").get<std::string>());
        x.set_new_literal_string_item(j.at("newLiteralStringItem").get<std::string>());
        x.set_new_literal_number_item(j.at("newLiteralNumberItem").get<std::uint32_t>());
        x.set_new_enum_item(j.at("newEnumItem").get<NewEnumItem>());
        x.set_new_native_enum_item(j.at("newNativeEnumItem").get<NewNativeEnumItem>());
        x.set_new_double_item(j.at("newDoubleItem").get<double>());
        x.set_new_big_int_item(j.at("newBigIntItem").get<std::int64_t>());
        x.set_new_int64_item(j.at("newInt64Item").get<std::int64_t>());
        x.set_new_int32_item(j.at("newInt32Item").get<std::int32_t>());
        x.set_new_boolean_item(j.at("newBooleanItem").get<bool>());
        x.set_new_object_item(j.at("newObjectItem").get<NewObjectItem>());
        x.set_new_array_item(j.at("newArrayItem").get<NewArrayItem>());
        x.set_new_record_item(j.at("newRecordItem").get<std::unordered_map<std::string, double>>());
        x.set_new_map_item(j.at("newMapItem").get<std::unordered_map<std::string, double>>());
        x.set_new_set_item(j.at("newSetItem").get<std::set<std::string>>());
        x.set_new_tuple_item(j.at("newTupleItem").get<std::tuple<double, std::string, bool>>());
        x.set_new_union_item(j.at("newUnionItem").get<NewUnionItem>());
        x.set_new_discriminated_union_item(j.at("newDiscriminatedUnionItem").get<NewDiscriminatedUnionItem>());
        x.set_new_intersection_item(j.at("newIntersectionItem").get<NewIntersectionItem>());
        x.set_new_any_item(j.at("newAnyItem").get<json>());
        x.set_new_optional_item(get_opt<std::string>(j, "newOptionalItem"));
        x.set_new_nullable_item(get_opt<std::string>(j, "newNullableItem"));
    }

}