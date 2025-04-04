#include "cpp_supported_schemas.expect17.class.hpp"
#include "cpp_supported_schemas.expect17.struct.hpp"
#include "../cpp_test_utils.cpp"

int main() {
    if (testType(zodtocppstruct::CppSupportedSchemas(), jSupportedSchemas)) {
        std::cout <<
            "C++17 - Supported Schemas as Struct - Test passed: " <<
            "Serialization and deserialization as Struct are equivalent." <<
            std::endl;
    }
    else {
        std::cerr <<
            "C++17 - Supported Schemas as Struct - Test failed: " <<
            "Serialization and deserialization as Struct are not equivalent." <<
            std::endl;
    }

    if (testType(zodtocppclass::CppSupportedSchemas(), jSupportedSchemas)) {
        std::cout <<
            "C++17 - Supported Schemas as Class - Test passed: " <<
            "Serialization and deserialization as Class are equivalent." <<
            std::endl;
    }
    else {
        std::cerr <<
            "C++17 - Supported Schemas as Class - Test failed: " <<
            "Serialization and deserialization as Class are not equivalent." <<
            std::endl;
    }

    return 0;
}
