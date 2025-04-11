#include "./struct-expected/user.dtos.hpp"
#include "./struct-expected/cpp_supported_schemas.entity.hpp"
#include "./struct-expected/cpp_supported_schemas.app.hpp"
#include "../cpp_test_utils.cpp"

int main() {
    std::string testName = "C++17 - Layered Struct";

    testTypeSerialization(
        testName,
        typeid(USER_DTOS::UserDtos).name(),
        USER_DTOS::UserDtos(),
        jUserDtos,
        false
    );
    
    testTypeSerialization(
        testName,
        typeid(CPP_SUPPORTED_SCHEMAS::CppSupportedSchemas).name(),
        CPP_SUPPORTED_SCHEMAS::CppSupportedSchemas(),
        jSupportedSchemasLayeredEntity,
        false
    );

    testTypeSerialization(
        testName,
        typeid(CPP_SUPPORTED_SCHEMAS_APP::CppSupportedSchemasApplication).name(),
        CPP_SUPPORTED_SCHEMAS_APP::CppSupportedSchemasApplication(),
        jSupportedSchemasLayeredApplication,
        false
    );

    std::cout << "-----------------------------------------" << std::endl;

    return 0;
}
