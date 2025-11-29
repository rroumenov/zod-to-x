#include "./class-expected/cpp_supported_schemas.expect17.class.hpp"
#include "./struct-expected/cpp_supported_schemas.expect17.struct.hpp"
#include "../cpp_test_utils.cpp"

int main() {
    int totalTests = 0, passedTests = 0;

    if (testTypeSerialization(
        "C++17 - Supported Schemas as Struct",
        typeid(zodtocppstruct::CppSupportedSchemas).name(),
        zodtocppstruct::CppSupportedSchemas(),
        jSupportedSchemas,
        false
    )) passedTests++; totalTests++;
    
    if (testTypeSerialization(
        "C++17 - Supported Schemas as Class",
        typeid(zodtocppclass::CppSupportedSchemas).name(),
        zodtocppclass::CppSupportedSchemas(),
        jSupportedSchemas,
        false
    )) passedTests++; totalTests++;

    std::cout << "-----------------------------------------" << std::endl;
    std::cout << (passedTests == totalTests ? "✓" : "✗") << " (" << passedTests << "/" << totalTests << ")" << std::endl;

    return passedTests == totalTests ? 0 : 1;
}
