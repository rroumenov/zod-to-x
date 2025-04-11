#include "./class-expected/cpp_supported_schemas.expect17.class.hpp"
#include "./struct-expected/cpp_supported_schemas.expect17.struct.hpp"
#include "../cpp_test_utils.cpp"

int main() {
    testTypeSerialization(
        "C++17 - Supported Schemas as Struct",
        typeid(zodtocppstruct::CppSupportedSchemas).name(),
        zodtocppstruct::CppSupportedSchemas(),
        jSupportedSchemas,
        false
    );
    
    testTypeSerialization(
        "C++17 - Supported Schemas as Class",
        typeid(zodtocppclass::CppSupportedSchemas).name(),
        zodtocppclass::CppSupportedSchemas(),
        jSupportedSchemas,
        false
    );

    std::cout << "-----------------------------------------" << std::endl;

    return 0;
}
