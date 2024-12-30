/**
 * @description Generates a reusable C++ utility for handling optional fields in JSON serialization
 *              and deserialization using the nlohmann::json library and boost::optional.
 * @param indent - Specifies the level of indentation for the generated code.
 * @param includeNulls - Specifies whether to include null values in the JSON serialization.
 * @param useBoost - Specifies whether to use boost::optional instead of std::optional.
 * @param namespace - Specifies the namespace to use for the generated code.
 * @returns
 */
export function getNlohmannOptionalHelper(
    indent: number,
    includeNulls: boolean,
    useBoost: boolean,
    namespace: string
): string[] {
    const optType = useBoost ? "boost::optional" : "std::optional";
    const setOpt = includeNulls
        ? [
              `template <typename T>`,
              `void set_opt(json& j, const std::string& key, const ${optType}<T>& opt) {`,
              `${" ".repeat(indent)}if (opt) {`,
              `${" ".repeat(indent * 2)}j[key] = *opt;`,
              `${" ".repeat(indent)}}`,
              `${" ".repeat(indent)}else {`,
              `${" ".repeat(indent * 2)}j[key] = nullptr;`,
              `${" ".repeat(indent)}}`,
              `}`,
              `#endif\n`,
          ]
        : [
              `template <typename T>`,
              `void set_opt(json& j, const std::string& key, const ${optType}<T>& opt) {`,
              `${" ".repeat(indent)}if (opt) {`,
              `${" ".repeat(indent * 2)}j[key] = *opt;`,
              `${" ".repeat(indent)}}`,
              `}`,
              `#endif\n`,
          ];
    return [
        `#ifndef NLOHMANN_OPTIONAL_HELPER_${namespace}`,
        `#define NLOHMANN_OPTIONAL_HELPER_${namespace}`,
        "template <typename T>",
        `${optType}<T> get_opt(const json& j, const std::string& key) {`,
        `${" ".repeat(indent)}auto it = j.find(key);`,
        `${" ".repeat(indent)}if (it != j.end() && !it->is_null()) {`,
        `${" ".repeat(indent * 2)}return it->get<T>();`,
        `${" ".repeat(indent)}}`,
        `${" ".repeat(indent)}return ${optType}<T>();`,
        `}\n`,
        ...setOpt,
    ];
}
