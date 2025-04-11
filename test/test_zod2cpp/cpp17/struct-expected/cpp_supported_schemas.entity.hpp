// This is
// a multiline
// header.

#pragma once

#include <cstdint>
#include <nlohmann/json.hpp>
#include <optional>
#include <set>
#include <stdexcept>
#include <string>
#include <tuple>
#include <unordered_map>
#include <variant>
#include <vector>

using nlohmann::json;

namespace CPP_SUPPORTED_SCHEMAS {
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

    struct ObjectItem {
        std::string key;
    };

    struct OtherObjectItem {
        std::string other_key;
    };

    struct ObjectItemWithDiscriminator {
        std::string key;
        EnumItem discriminator;
    };

    struct OtherObjectItemWithDiscriminator {
        std::string other_key;
        EnumItem discriminator;
    };

    using UnionItem = std::variant<ObjectItem, OtherObjectItem>;

    using DiscriminatedUnionItem = std::variant<ObjectItemWithDiscriminator, OtherObjectItemWithDiscriminator>;

    struct IntersectionItem : public ObjectItem, public OtherObjectItem {
        // Intersection fields are inherited from base structs.
    };

    struct CppSupportedSchemas {
        std::string string_item;
        std::string literal_string_item;
        std::uint32_t literal_number_item;
        EnumItem enum_item;
        NativeEnumItem native_enum_item;
        double double_item;
        std::int64_t big_int_item;
        std::int64_t int64_item;
        std::int32_t int32_item;
        bool boolean_item;
        ObjectItem object_item;
        OtherObjectItem other_object_item;
        ObjectItemWithDiscriminator object_item_with_discriminator;
        OtherObjectItemWithDiscriminator other_object_item_with_discriminator;
        std::vector<std::vector<double>> array_item;
        std::unordered_map<std::string, double> record_item;
        std::unordered_map<std::string, double> map_item;
        std::set<std::string> set_item;
        std::tuple<double, std::string, bool> tuple_item;
        UnionItem union_item;
        DiscriminatedUnionItem discriminated_union_item;
        IntersectionItem intersection_item;
        json any_item;
        std::optional<std::string> optional_item;
        std::optional<std::string> nullable_item;
    };

}

namespace CPP_SUPPORTED_SCHEMAS {
    #ifndef NLOHMANN_OPTIONAL_HELPER_CPP_SUPPORTED_SCHEMAS
    #define NLOHMANN_OPTIONAL_HELPER_CPP_SUPPORTED_SCHEMAS
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
        j["key"] = x.key;
    }

    inline void from_json(const json& j, ObjectItem& x) {
        x.key = j.at("key").get<std::string>();
    }

    inline void to_json(json& j, const OtherObjectItem& x) {
        j["otherKey"] = x.other_key;
    }

    inline void from_json(const json& j, OtherObjectItem& x) {
        x.other_key = j.at("otherKey").get<std::string>();
    }

    inline void to_json(json& j, const ObjectItemWithDiscriminator& x) {
        j["key"] = x.key;
        j["discriminator"] = x.discriminator;
    }

    inline void from_json(const json& j, ObjectItemWithDiscriminator& x) {
        x.key = j.at("key").get<std::string>();
        x.discriminator = j.at("discriminator").get<EnumItem>();
    }

    inline void to_json(json& j, const OtherObjectItemWithDiscriminator& x) {
        j["otherKey"] = x.other_key;
        j["discriminator"] = x.discriminator;
    }

    inline void from_json(const json& j, OtherObjectItemWithDiscriminator& x) {
        x.other_key = j.at("otherKey").get<std::string>();
        x.discriminator = j.at("discriminator").get<EnumItem>();
    }

    inline void to_json(json& j, const UnionItem& x) {
        std::visit(
            [&j](auto&& arg) {
                using T = std::decay_t<decltype(arg)>;
                if constexpr (std::is_same_v<T, ObjectItem>) {
                    j = arg;
                }
                else if constexpr (std::is_same_v<T, OtherObjectItem>) {
                    j = arg;
                }
                else {
                    throw std::runtime_error("Unknown UnionItem type.");
                }
            },
            x
        );
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
        std::visit(
            [&j](auto&& arg) {
                using T = std::decay_t<decltype(arg)>;
                if constexpr (std::is_same_v<T, ObjectItemWithDiscriminator>) {
                    j = arg;
                }
                else if constexpr (std::is_same_v<T, OtherObjectItemWithDiscriminator>) {
                    j = arg;
                }
                else {
                    throw std::runtime_error("Unknown DiscriminatedUnionItem type.");
                }
            },
            x
        );
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
        j["stringItem"] = x.string_item;
        j["literalStringItem"] = x.literal_string_item;
        j["literalNumberItem"] = x.literal_number_item;
        j["enumItem"] = x.enum_item;
        j["nativeEnumItem"] = x.native_enum_item;
        j["doubleItem"] = x.double_item;
        j["bigIntItem"] = x.big_int_item;
        j["int64Item"] = x.int64_item;
        j["int32Item"] = x.int32_item;
        j["booleanItem"] = x.boolean_item;
        j["objectItem"] = x.object_item;
        j["otherObjectItem"] = x.other_object_item;
        j["objectItemWithDiscriminator"] = x.object_item_with_discriminator;
        j["otherObjectItemWithDiscriminator"] = x.other_object_item_with_discriminator;
        j["arrayItem"] = x.array_item;
        j["recordItem"] = x.record_item;
        j["mapItem"] = x.map_item;
        j["setItem"] = x.set_item;
        j["tupleItem"] = x.tuple_item;
        j["unionItem"] = x.union_item;
        j["discriminatedUnionItem"] = x.discriminated_union_item;
        j["intersectionItem"] = x.intersection_item;
        j["anyItem"] = x.any_item;
        set_opt<std::string>(j, "optionalItem", x.optional_item);
        set_opt<std::string>(j, "nullableItem", x.nullable_item);
    }

    inline void from_json(const json& j, CppSupportedSchemas& x) {
        x.string_item = j.at("stringItem").get<std::string>();
        x.literal_string_item = j.at("literalStringItem").get<std::string>();
        x.literal_number_item = j.at("literalNumberItem").get<std::uint32_t>();
        x.enum_item = j.at("enumItem").get<EnumItem>();
        x.native_enum_item = j.at("nativeEnumItem").get<NativeEnumItem>();
        x.double_item = j.at("doubleItem").get<double>();
        x.big_int_item = j.at("bigIntItem").get<std::int64_t>();
        x.int64_item = j.at("int64Item").get<std::int64_t>();
        x.int32_item = j.at("int32Item").get<std::int32_t>();
        x.boolean_item = j.at("booleanItem").get<bool>();
        x.object_item = j.at("objectItem").get<ObjectItem>();
        x.other_object_item = j.at("otherObjectItem").get<OtherObjectItem>();
        x.object_item_with_discriminator = j.at("objectItemWithDiscriminator").get<ObjectItemWithDiscriminator>();
        x.other_object_item_with_discriminator = j.at("otherObjectItemWithDiscriminator").get<OtherObjectItemWithDiscriminator>();
        x.array_item = j.at("arrayItem").get<std::vector<std::vector<double>>>();
        x.record_item = j.at("recordItem").get<std::unordered_map<std::string, double>>();
        x.map_item = j.at("mapItem").get<std::unordered_map<std::string, double>>();
        x.set_item = j.at("setItem").get<std::set<std::string>>();
        x.tuple_item = j.at("tupleItem").get<std::tuple<double, std::string, bool>>();
        x.union_item = j.at("unionItem").get<UnionItem>();
        x.discriminated_union_item = j.at("discriminatedUnionItem").get<DiscriminatedUnionItem>();
        x.intersection_item = j.at("intersectionItem").get<IntersectionItem>();
        x.any_item = j.at("anyItem").get<json>();
        x.optional_item = get_opt<std::string>(j, "optionalItem");
        x.nullable_item = get_opt<std::string>(j, "nullableItem");
    }

}