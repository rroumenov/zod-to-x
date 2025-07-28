// This is
// a multiline
// header.

#pragma once

#include <boost/optional.hpp>
#include <boost/variant.hpp>
#include <cstdint>
#include <nlohmann/json.hpp>
#include <set>
#include <stdexcept>
#include <string>
#include <tuple>
#include <unordered_map>
#include <vector>

using nlohmann::json;

namespace CPP_SUPPORTED_SCHEMAS {
    using StringItem = std::string;

    enum class EnumItem: int {
        Enum1,
        Enum2,
        Enum3
    };

    enum class NativeEnumItem: int {
        NativeEnum1,
        NativeEnum2,
        NativeEnum3
    };

    using DoubleItem = double;

    using BigIntItem = std::int64_t;

    using Int64Item = std::int64_t;

    using Int32Item = std::int32_t;

    using BooleanItem = bool;

    class ObjectItem {
    private:
        std::string key;
    
    public:
        ObjectItem() = default;
        virtual ~ObjectItem() = default;
        
        const std::string& get_key() const { return this->key; }
        std::string& get_mut_key() { return this->key; }
        void set_key(const std::string& value) { this->key = value; }
    };

    class OtherObjectItem {
    private:
        std::string other_key;
    
    public:
        OtherObjectItem() = default;
        virtual ~OtherObjectItem() = default;
        
        const std::string& get_other_key() const { return this->other_key; }
        std::string& get_mut_other_key() { return this->other_key; }
        void set_other_key(const std::string& value) { this->other_key = value; }
    };

    class ObjectItemWithDiscriminator {
    private:
        std::string key;
        EnumItem discriminator;
    
    public:
        ObjectItemWithDiscriminator() = default;
        virtual ~ObjectItemWithDiscriminator() = default;
        
        const std::string& get_key() const { return this->key; }
        std::string& get_mut_key() { return this->key; }
        void set_key(const std::string& value) { this->key = value; }
        
        const EnumItem& get_discriminator() const { return this->discriminator; }
        EnumItem& get_mut_discriminator() { return this->discriminator; }
        void set_discriminator(const EnumItem& value) { this->discriminator = value; }
    };

    class OtherObjectItemWithDiscriminator {
    private:
        std::string other_key;
        EnumItem discriminator;
    
    public:
        OtherObjectItemWithDiscriminator() = default;
        virtual ~OtherObjectItemWithDiscriminator() = default;
        
        const std::string& get_other_key() const { return this->other_key; }
        std::string& get_mut_other_key() { return this->other_key; }
        void set_other_key(const std::string& value) { this->other_key = value; }
        
        const EnumItem& get_discriminator() const { return this->discriminator; }
        EnumItem& get_mut_discriminator() { return this->discriminator; }
        void set_discriminator(const EnumItem& value) { this->discriminator = value; }
    };

    using ArrayItem = std::vector<std::vector<double>>;

    using RecordItem = std::unordered_map<std::string, double>;

    using MapItem = std::unordered_map<std::string, double>;

    using SetItem = std::set<std::string>;

    using TupleItem = std::tuple<double, std::string, bool>;

    using UnionItem = boost::variant<
        ObjectItem,
        OtherObjectItem
    >;

    using DiscriminatedUnionItem = boost::variant<
        ObjectItemWithDiscriminator,
        OtherObjectItemWithDiscriminator
    >;

    class IntersectionItem : public ObjectItem, public OtherObjectItem {
    public:
        IntersectionItem() = default;
        virtual ~IntersectionItem() = default;
    
        // Intersection fields are inherited from base classes.
    };

    using AnyItem = json;

    class CppSupportedSchemas {
    private:
        StringItem string_item;
        std::string literal_string_item;
        std::uint32_t literal_number_item;
        EnumItem enum_item;
        NativeEnumItem native_enum_item;
        DoubleItem double_item;
        BigIntItem big_int_item;
        Int64Item int64_item;
        Int32Item int32_item;
        BooleanItem boolean_item;
        ObjectItem object_item;
        OtherObjectItem other_object_item;
        ObjectItemWithDiscriminator object_item_with_discriminator;
        OtherObjectItemWithDiscriminator other_object_item_with_discriminator;
        ArrayItem array_item;
        RecordItem record_item;
        MapItem map_item;
        SetItem set_item;
        TupleItem tuple_item;
        UnionItem union_item;
        DiscriminatedUnionItem discriminated_union_item;
        IntersectionItem intersection_item;
        AnyItem any_item;
        boost::optional<std::string> optional_item;
        boost::optional<std::string> nullable_item;
    
    public:
        CppSupportedSchemas() = default;
        virtual ~CppSupportedSchemas() = default;
        
        const StringItem& get_string_item() const { return this->string_item; }
        StringItem& get_mut_string_item() { return this->string_item; }
        void set_string_item(const StringItem& value) { this->string_item = value; }
        
        const std::string& get_literal_string_item() const { return this->literal_string_item; }
        std::string& get_mut_literal_string_item() { return this->literal_string_item; }
        void set_literal_string_item(const std::string& value) { this->literal_string_item = value; }
        
        const std::uint32_t& get_literal_number_item() const { return this->literal_number_item; }
        std::uint32_t& get_mut_literal_number_item() { return this->literal_number_item; }
        void set_literal_number_item(const std::uint32_t& value) { this->literal_number_item = value; }
        
        const EnumItem& get_enum_item() const { return this->enum_item; }
        EnumItem& get_mut_enum_item() { return this->enum_item; }
        void set_enum_item(const EnumItem& value) { this->enum_item = value; }
        
        const NativeEnumItem& get_native_enum_item() const { return this->native_enum_item; }
        NativeEnumItem& get_mut_native_enum_item() { return this->native_enum_item; }
        void set_native_enum_item(const NativeEnumItem& value) { this->native_enum_item = value; }
        
        const DoubleItem& get_double_item() const { return this->double_item; }
        DoubleItem& get_mut_double_item() { return this->double_item; }
        void set_double_item(const DoubleItem& value) { this->double_item = value; }
        
        const BigIntItem& get_big_int_item() const { return this->big_int_item; }
        BigIntItem& get_mut_big_int_item() { return this->big_int_item; }
        void set_big_int_item(const BigIntItem& value) { this->big_int_item = value; }
        
        const Int64Item& get_int64_item() const { return this->int64_item; }
        Int64Item& get_mut_int64_item() { return this->int64_item; }
        void set_int64_item(const Int64Item& value) { this->int64_item = value; }
        
        const Int32Item& get_int32_item() const { return this->int32_item; }
        Int32Item& get_mut_int32_item() { return this->int32_item; }
        void set_int32_item(const Int32Item& value) { this->int32_item = value; }
        
        const BooleanItem& get_boolean_item() const { return this->boolean_item; }
        BooleanItem& get_mut_boolean_item() { return this->boolean_item; }
        void set_boolean_item(const BooleanItem& value) { this->boolean_item = value; }
        
        const ObjectItem& get_object_item() const { return this->object_item; }
        ObjectItem& get_mut_object_item() { return this->object_item; }
        void set_object_item(const ObjectItem& value) { this->object_item = value; }
        
        const OtherObjectItem& get_other_object_item() const { return this->other_object_item; }
        OtherObjectItem& get_mut_other_object_item() { return this->other_object_item; }
        void set_other_object_item(const OtherObjectItem& value) { this->other_object_item = value; }
        
        const ObjectItemWithDiscriminator& get_object_item_with_discriminator() const { return this->object_item_with_discriminator; }
        ObjectItemWithDiscriminator& get_mut_object_item_with_discriminator() { return this->object_item_with_discriminator; }
        void set_object_item_with_discriminator(const ObjectItemWithDiscriminator& value) { this->object_item_with_discriminator = value; }
        
        const OtherObjectItemWithDiscriminator& get_other_object_item_with_discriminator() const { return this->other_object_item_with_discriminator; }
        OtherObjectItemWithDiscriminator& get_mut_other_object_item_with_discriminator() { return this->other_object_item_with_discriminator; }
        void set_other_object_item_with_discriminator(const OtherObjectItemWithDiscriminator& value) { this->other_object_item_with_discriminator = value; }
        
        const ArrayItem& get_array_item() const { return this->array_item; }
        ArrayItem& get_mut_array_item() { return this->array_item; }
        void set_array_item(const ArrayItem& value) { this->array_item = value; }
        
        const RecordItem& get_record_item() const { return this->record_item; }
        RecordItem& get_mut_record_item() { return this->record_item; }
        void set_record_item(const RecordItem& value) { this->record_item = value; }
        
        const MapItem& get_map_item() const { return this->map_item; }
        MapItem& get_mut_map_item() { return this->map_item; }
        void set_map_item(const MapItem& value) { this->map_item = value; }
        
        const SetItem& get_set_item() const { return this->set_item; }
        SetItem& get_mut_set_item() { return this->set_item; }
        void set_set_item(const SetItem& value) { this->set_item = value; }
        
        const TupleItem& get_tuple_item() const { return this->tuple_item; }
        TupleItem& get_mut_tuple_item() { return this->tuple_item; }
        void set_tuple_item(const TupleItem& value) { this->tuple_item = value; }
        
        const UnionItem& get_union_item() const { return this->union_item; }
        UnionItem& get_mut_union_item() { return this->union_item; }
        void set_union_item(const UnionItem& value) { this->union_item = value; }
        
        const DiscriminatedUnionItem& get_discriminated_union_item() const { return this->discriminated_union_item; }
        DiscriminatedUnionItem& get_mut_discriminated_union_item() { return this->discriminated_union_item; }
        void set_discriminated_union_item(const DiscriminatedUnionItem& value) { this->discriminated_union_item = value; }
        
        const IntersectionItem& get_intersection_item() const { return this->intersection_item; }
        IntersectionItem& get_mut_intersection_item() { return this->intersection_item; }
        void set_intersection_item(const IntersectionItem& value) { this->intersection_item = value; }
        
        const AnyItem& get_any_item() const { return this->any_item; }
        AnyItem& get_mut_any_item() { return this->any_item; }
        void set_any_item(const AnyItem& value) { this->any_item = value; }
        
        boost::optional<std::string> get_optional_item() const { return this->optional_item; }
        void set_optional_item(boost::optional<std::string> value) { this->optional_item = value; }
        
        boost::optional<std::string> get_nullable_item() const { return this->nullable_item; }
        void set_nullable_item(boost::optional<std::string> value) { this->nullable_item = value; }
    };

}

namespace CPP_SUPPORTED_SCHEMAS {
    #ifndef NLOHMANN_OPTIONAL_HELPER_CPP_SUPPORTED_SCHEMAS
    #define NLOHMANN_OPTIONAL_HELPER_CPP_SUPPORTED_SCHEMAS
    template <typename T>
    boost::optional<T> get_opt(const json& j, const std::string& key) {
        auto it = j.find(key);
        if (it != j.end() && !it->is_null()) {
            return it->get<T>();
        }
        return boost::optional<T>();
    }

    template <typename T>
    void set_opt(json& j, const std::string& key, const boost::optional<T>& opt) {
        if (opt) {
            j[key] = *opt;
        }
        else {
            j[key] = nullptr;
        }
    }
    #endif

    inline void to_json(json& j, const EnumItem& x) {
        switch (x) {
            case EnumItem::Enum1: j = "Enum1"; break;
            case EnumItem::Enum2: j = "Enum2"; break;
            case EnumItem::Enum3: j = "Enum3"; break;
            default: throw std::runtime_error("Unexpected value serializing enum EnumItem: " + std::to_string(static_cast<int>(x)));
        }
    }

    inline void from_json(const json& j, EnumItem& x) {
        if (j == "Enum1") x = EnumItem::Enum1;
        else if (j == "Enum2") x = EnumItem::Enum2;
        else if (j == "Enum3") x = EnumItem::Enum3;
        else { throw std::runtime_error("Unexpected value deserializing enum EnumItem."); }
    }

    inline void to_json(json& j, const NativeEnumItem& x) {
        switch (x) {
            case NativeEnumItem::NativeEnum1: j = 1; break;
            case NativeEnumItem::NativeEnum2: j = 2; break;
            case NativeEnumItem::NativeEnum3: j = "NativeEnum3"; break;
            default: throw std::runtime_error("Unexpected value serializing enum NativeEnumItem: " + std::to_string(static_cast<int>(x)));
        }
    }

    inline void from_json(const json& j, NativeEnumItem& x) {
        if (j == 1) x = NativeEnumItem::NativeEnum1;
        else if (j == 2) x = NativeEnumItem::NativeEnum2;
        else if (j == "NativeEnum3") x = NativeEnumItem::NativeEnum3;
        else { throw std::runtime_error("Unexpected value deserializing enum NativeEnumItem."); }
    }

    inline void to_json(json& j, const ObjectItem& x) {
        j["key"] = x.get_key();
    }

    inline void from_json(const json& j, ObjectItem& x) {
        x.set_key(j.at("key").get<std::string>());
    }

    inline void to_json(json& j, const OtherObjectItem& x) {
        j["otherKey"] = x.get_other_key();
    }

    inline void from_json(const json& j, OtherObjectItem& x) {
        x.set_other_key(j.at("otherKey").get<std::string>());
    }

    inline void to_json(json& j, const ObjectItemWithDiscriminator& x) {
        j["key"] = x.get_key();
        j["discriminator"] = x.get_discriminator();
    }

    inline void from_json(const json& j, ObjectItemWithDiscriminator& x) {
        x.set_key(j.at("key").get<std::string>());
        x.set_discriminator(j.at("discriminator").get<EnumItem>());
    }

    inline void to_json(json& j, const OtherObjectItemWithDiscriminator& x) {
        j["otherKey"] = x.get_other_key();
        j["discriminator"] = x.get_discriminator();
    }

    inline void from_json(const json& j, OtherObjectItemWithDiscriminator& x) {
        x.set_other_key(j.at("otherKey").get<std::string>());
        x.set_discriminator(j.at("discriminator").get<EnumItem>());
    }

    inline void to_json(json& j, const UnionItem& x) {
        if (x.type() == typeid(ObjectItem)) {
            j = boost::get<ObjectItem>(x);
        }
        else if (x.type() == typeid(OtherObjectItem)) {
            j = boost::get<OtherObjectItem>(x);
        }
        else {
            throw std::runtime_error("Unknown UnionItem type.");
        }
    }

    inline void from_json(const json& j, UnionItem& x) {
        try {
            // Try to deserialize as ObjectItem
            x = j.get<ObjectItem>();
            return;
        } catch (const std::exception&) {
            // Fall through to try the next type
        }
        try {
            // Try to deserialize as OtherObjectItem
            x = j.get<OtherObjectItem>();
            return;
        } catch (const std::exception&) {
            // None of the types matched. Error
            throw std::runtime_error("Failed to deserialize UnionItem: unknown format");
        }
    }

    inline void to_json(json& j, const DiscriminatedUnionItem& x) {
        if (x.type() == typeid(ObjectItemWithDiscriminator)) {
            j = boost::get<ObjectItemWithDiscriminator>(x);
        }
        else if (x.type() == typeid(OtherObjectItemWithDiscriminator)) {
            j = boost::get<OtherObjectItemWithDiscriminator>(x);
        }
        else {
            throw std::runtime_error("Unknown DiscriminatedUnionItem type.");
        }
    }

    inline void from_json(const json& j, DiscriminatedUnionItem& x) {
        const auto& k = j.at("discriminator").get<std::string>();
        if (k == "Enum1") {
            x = j.get<ObjectItemWithDiscriminator>();
        }
        else if (k == "Enum2") {
            x = j.get<OtherObjectItemWithDiscriminator>();
        }
        else {
            // None of the types matched. Error
            throw std::runtime_error("Failed to deserialize DiscriminatedUnionItem: unknown format");
        }
    }

    inline void to_json(json& j, const IntersectionItem& x) {
        to_json(j, static_cast<const ObjectItem&>(x));
        to_json(j, static_cast<const OtherObjectItem&>(x));
    }

    inline void from_json(const json& j, IntersectionItem& x) {
        from_json(j, static_cast<ObjectItem&>(x));
        from_json(j, static_cast<OtherObjectItem&>(x));
    }

    inline void to_json(json& j, const CppSupportedSchemas& x) {
        j["stringItem"] = x.get_string_item();
        j["literalStringItem"] = x.get_literal_string_item();
        j["literalNumberItem"] = x.get_literal_number_item();
        j["enumItem"] = x.get_enum_item();
        j["nativeEnumItem"] = x.get_native_enum_item();
        j["doubleItem"] = x.get_double_item();
        j["bigIntItem"] = x.get_big_int_item();
        j["int64Item"] = x.get_int64_item();
        j["int32Item"] = x.get_int32_item();
        j["booleanItem"] = x.get_boolean_item();
        j["objectItem"] = x.get_object_item();
        j["otherObjectItem"] = x.get_other_object_item();
        j["objectItemWithDiscriminator"] = x.get_object_item_with_discriminator();
        j["otherObjectItemWithDiscriminator"] = x.get_other_object_item_with_discriminator();
        j["arrayItem"] = x.get_array_item();
        j["recordItem"] = x.get_record_item();
        j["mapItem"] = x.get_map_item();
        j["setItem"] = x.get_set_item();
        j["tupleItem"] = x.get_tuple_item();
        j["unionItem"] = x.get_union_item();
        j["discriminatedUnionItem"] = x.get_discriminated_union_item();
        j["intersectionItem"] = x.get_intersection_item();
        j["anyItem"] = x.get_any_item();
        set_opt<std::string>(j, "optionalItem", x.get_optional_item());
        set_opt<std::string>(j, "nullableItem", x.get_nullable_item());
    }

    inline void from_json(const json& j, CppSupportedSchemas& x) {
        x.set_string_item(j.at("stringItem").get<StringItem>());
        x.set_literal_string_item(j.at("literalStringItem").get<std::string>());
        x.set_literal_number_item(j.at("literalNumberItem").get<std::uint32_t>());
        x.set_enum_item(j.at("enumItem").get<EnumItem>());
        x.set_native_enum_item(j.at("nativeEnumItem").get<NativeEnumItem>());
        x.set_double_item(j.at("doubleItem").get<DoubleItem>());
        x.set_big_int_item(j.at("bigIntItem").get<BigIntItem>());
        x.set_int64_item(j.at("int64Item").get<Int64Item>());
        x.set_int32_item(j.at("int32Item").get<Int32Item>());
        x.set_boolean_item(j.at("booleanItem").get<BooleanItem>());
        x.set_object_item(j.at("objectItem").get<ObjectItem>());
        x.set_other_object_item(j.at("otherObjectItem").get<OtherObjectItem>());
        x.set_object_item_with_discriminator(j.at("objectItemWithDiscriminator").get<ObjectItemWithDiscriminator>());
        x.set_other_object_item_with_discriminator(j.at("otherObjectItemWithDiscriminator").get<OtherObjectItemWithDiscriminator>());
        x.set_array_item(j.at("arrayItem").get<ArrayItem>());
        x.set_record_item(j.at("recordItem").get<RecordItem>());
        x.set_map_item(j.at("mapItem").get<MapItem>());
        x.set_set_item(j.at("setItem").get<SetItem>());
        x.set_tuple_item(j.at("tupleItem").get<TupleItem>());
        x.set_union_item(j.at("unionItem").get<UnionItem>());
        x.set_discriminated_union_item(j.at("discriminatedUnionItem").get<DiscriminatedUnionItem>());
        x.set_intersection_item(j.at("intersectionItem").get<IntersectionItem>());
        x.set_any_item(j.at("anyItem").get<AnyItem>());
        x.set_optional_item(get_opt<std::string>(j, "optionalItem"));
        x.set_nullable_item(get_opt<std::string>(j, "nullableItem"));
    }

}