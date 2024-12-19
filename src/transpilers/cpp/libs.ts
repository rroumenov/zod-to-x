/** Required imports for C++11 */
export const LIB = {
    exceptions: "#include <stdexcept>",
    integers: "#include <cstdint>",
    map: "#include <unordered_map>",
    nlohmann: "#include <nlohmann/json.hpp>",
    optional: "#include <boost/optional.hpp>",
    set: "#include <set>",
    string: "#include <string>",
    variant: "#include <boost/variant.hpp>",
    vector: "#include <vector>"
};

export const USING = {
    nlohmann: "using nlohmann::json;"
}