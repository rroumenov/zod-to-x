#include "./struct-expected/user.dtos.hpp"
#include "./struct-expected/user.api.hpp"
#include "./struct-expected/cpp_supported_schemas.entity.hpp"
#include "./struct-expected/cpp_supported_schemas.app.hpp"
#include "../cpp_test_utils.cpp"

int main() {
    std::string testName = "C++11 - Layered Struct";
    int totalTests = 0, passedTests = 0;

    if (testTypeSerialization(
        testName,
        typeid(USER_DTOS::UserDtos).name(),
        USER_DTOS::UserDtos(),
        jUserDtos,
        false
    )) passedTests++; totalTests++;

    if (testTypeSerialization(
        testName,
        typeid(USER_API::UserApi).name(),
        USER_API::UserApi(),
        jUserApi,
        false
    )) passedTests++; totalTests++;
    
    if (testTypeSerialization(
        testName,
        typeid(CPP_SUPPORTED_SCHEMAS::CppSupportedSchemas).name(),
        CPP_SUPPORTED_SCHEMAS::CppSupportedSchemas(),
        jSupportedSchemasLayeredEntity,
        false
    )) passedTests++; totalTests++;

    if (testTypeSerialization(
        testName,
        typeid(CPP_SUPPORTED_SCHEMAS_APP::CppSupportedSchemasApplication).name(),
        CPP_SUPPORTED_SCHEMAS_APP::CppSupportedSchemasApplication(),
        jSupportedSchemasLayeredApplication,
        false
    )) passedTests++; totalTests++;

    std::cout << "-----------------------------------------" << std::endl;
    std::cout << (passedTests == totalTests ? "✓" : "✗") << " (" << passedTests << "/" << totalTests << ")" << std::endl;

    return passedTests == totalTests ? 0 : 1;
}
