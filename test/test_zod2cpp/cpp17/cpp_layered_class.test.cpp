#include "./class-expected/user.dtos.hpp"
#include "./class-expected/user.api.hpp"
#include "./class-expected/cpp_supported_schemas.entity.hpp"
#include "./class-expected/cpp_supported_schemas.app.hpp"
#include "../cpp_test_utils.cpp"

int main() {
    std::string testName = "C++17 - Layered Class";

    testTypeSerialization(
        testName,
        typeid(USER_DTOS::UserDtos).name(),
        USER_DTOS::UserDtos(),
        jUserDtos,
        false
    );

    testTypeSerialization(
        testName,
        typeid(USER_API::UserApi).name(),
        USER_API::UserApi(),
        jUserApi,
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
