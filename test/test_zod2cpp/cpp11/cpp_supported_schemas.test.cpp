#include "cpp_supported_schemas.expect.class.hpp"
#include "cpp_supported_schemas.expect.struct.hpp"
#include "../cpp_test_utils.cpp"

int main() {
    if (testType(zodtocppstruct::CppSupportedSchemas(), testJson)) {
        std::cout <<
            "C++11 - Test passed: Serialization and deserialization as Struct are equivalent." <<
            std::endl;
    }
    else {
        std::cerr <<
            "C++11 - Test failed: Serialization and deserialization as Struct are not equivalent." <<
            std::endl;
    }

    if (testType(zodtocppclass::CppSupportedSchemas(), testJson)) {
        std::cout <<
            "C++11 - Test passed: Serialization and deserialization as Class are equivalent." <<
            std::endl;
    }
    else {
        std::cerr <<
            "C++11 - Test failed: Serialization and deserialization as Class are not equivalent." <<
            std::endl;
    }

    return 0;
}
