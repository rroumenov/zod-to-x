/**
 * @description Generates a reusable C++ utility for handling optional fields in JSON serialization
 *              and deserialization using the nlohmann::json library and boost::optional.
 * @param indent - Specifies the level of indentation for the generated code.
 * @returns
 */
export function getNlohmannOptionalHelper(indent: number) {
    return [
        "#ifndef NLOHMANN_OPTIONAL_HELPER_zodtocpp",
        "#define NLOHMANN_OPTIONAL_HELPER_zodtocpp",
        "template <typename T>",
        "boost::optional<T> get_opt(const json& j, const std::string& key) {",
        `${" ".repeat(indent)}auto it = j.find(key);`,
        `${" ".repeat(indent)}if (it != j.end() && !it->is_null()) {`,
        `${" ".repeat(indent * 2)}return it->get<T>();`,
        `${" ".repeat(indent)}}`,
        `${" ".repeat(indent)}return boost::optional<T>();`,
        `}`,
        "",
        `template <typename T>`,
        `void set_opt(json& j, const std::string& key, const boost::optional<T>& opt) {`,
        `${" ".repeat(indent)}if (opt) {`,
        `${" ".repeat(indent * 2)}j[key] = *opt;`,
        `${" ".repeat(indent)}}`,
        `}`,
        `#endif\n`,
    ];
}
