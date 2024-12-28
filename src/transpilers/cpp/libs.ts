/**
 * @description C++ standard library imports
 * @param useBoost Whether to use Boost libraries (C++11) or standard C++ libraries (>=C++17)
 * @returns
 */
export function getLibs(useBoost: boolean) {
    return {
        // Shared imports
        exceptions: "#include <stdexcept>",
        integers: "#include <cstdint>",
        map: "#include <unordered_map>",
        nlohmann: "#include <nlohmann/json.hpp>",
        set: "#include <set>",
        string: "#include <string>",
        tuple: "#include <tuple>",
        vector: "#include <vector>",

        // Version-specific imports
        optional: useBoost ? "#include <boost/optional.hpp>" : "#include <optional>",
        variant: useBoost ? "#include <boost/variant.hpp>" : "#include <variant>",
    };
}

export const USING = {
    nlohmann: "using nlohmann::json;",
};
