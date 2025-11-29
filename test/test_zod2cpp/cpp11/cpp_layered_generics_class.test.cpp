#include "./class-expected/layered_generics.app.hpp"
#include "./class-expected/layered_generics.infra.hpp"
#include "../cpp_test_utils.cpp"

int main() {
    std::string testName = "C++11 - Layered Generics Class";
    int totalTests = 0, passedTests = 0;

    if (testTypeSerialization(
        testName,
        typeid(GENERICS_APP::NormalUserEntity).name(),
        GENERICS_APP::NormalUserEntity(),
        jGenericUserEntities["normalUserEntity"],
        false
    )) passedTests++; totalTests++;

    if (testTypeSerialization(
        testName,
        typeid(GENERICS_APP::AdminUserEntity).name(),
        GENERICS_APP::AdminUserEntity(),
        jGenericUserEntities["adminUserEntity"],
        false
    )) passedTests++; totalTests++;

    if (testTypeSerialization(
        testName,
        typeid(GENERICS_APP::NormalUserMetadata).name(),
        GENERICS_APP::NormalUserMetadata(),
        jGenericUserEntities["normalUserEntity"]["metadata"],
        false
    )) passedTests++; totalTests++;

    if (testTypeSerialization(
        testName,
        typeid(GENERICS_APP::AdminUserMetadata).name(),
        GENERICS_APP::AdminUserMetadata(),
        jGenericUserEntities["adminUserEntity"]["metadata"],
        false
    )) passedTests++; totalTests++;

    if (testTypeSerialization(
        testName,
        typeid(GENERICS_INFRA::SomeDtoResult).name(),
        GENERICS_INFRA::SomeDtoResult(),
        jInfrastructureTypesClass["httpSuccessfulResponse"]["data"],
        false
    )) passedTests++; totalTests++;

    if (testTypeSerialization(
        testName,
        typeid(GENERICS_INFRA::OtherDtoResult).name(),
        GENERICS_INFRA::OtherDtoResult(),
        jInfrastructureTypesClass["intersectedDataRetrieve"]["metadata"],
        false
    )) passedTests++; totalTests++;

    if (testTypeSerialization(
        testName,
        typeid(GENERICS_INFRA::HttpUnsuccessfulResponse).name(),
        GENERICS_INFRA::HttpUnsuccessfulResponse(),
        jInfrastructureTypesClass["httpUnsuccessfulResponse"],
        false
    )) passedTests++; totalTests++;

    json errorJson = {{"message", "Test error message"}};
    if (testTypeSerialization(
        testName,
        typeid(GENERICS_INFRA::HttpErrorResponse).name(),
        GENERICS_INFRA::HttpErrorResponse(),
        errorJson,
        false
    )) passedTests++; totalTests++;

    if (testTypeSerialization(
        testName,
        typeid(GENERICS_INFRA::HttpSuccessfulResponse<GENERICS_INFRA::SomeDtoResult>).name(),
        GENERICS_INFRA::HttpSuccessfulResponse<GENERICS_INFRA::SomeDtoResult>(),
        jInfrastructureTypesClass["httpSuccessfulResponse"],
        false
    )) passedTests++; totalTests++;

    if (testTypeSerialization(
        testName,
        typeid(GENERICS_APP::GenericUserEntity<GENERICS_APP::NormalUserMetadata>).name(),
        GENERICS_APP::GenericUserEntity<GENERICS_APP::NormalUserMetadata>(),
        jGenericUserEntities["normalUserEntity"],
        false
    )) passedTests++; totalTests++;

    if (testTypeSerialization(
        testName,
        typeid(GENERICS_APP::GenericUserEntity<GENERICS_INFRA::SomeDtoResult>).name(),
        GENERICS_APP::GenericUserEntity<GENERICS_INFRA::SomeDtoResult>(),
        jInfrastructureTypesClass["objectWithGeneric"]["userItem"],
        false
    )) passedTests++; totalTests++;

    if (testTypeSerialization(
        testName,
        typeid(GENERICS_INFRA::InternalObjectWithGeneric).name(),
        GENERICS_INFRA::InternalObjectWithGeneric(),
        jInfrastructureTypesClass["objectWithGeneric"]["internal"],
        false
    )) passedTests++; totalTests++;

    if (testTypeSerialization(
        testName,
        typeid(GENERICS_INFRA::DataRetrieve).name(),
        GENERICS_INFRA::DataRetrieve(),
        jInfrastructureTypesClass["dataRetrieve"],
        false
    )) passedTests++; totalTests++;

    if (testTypeSerialization(
        testName,
        typeid(GENERICS_INFRA::UserRetrieve).name(),
        GENERICS_INFRA::UserRetrieve(),
        jInfrastructureTypesClass["userRetrieve"],
        false
    )) passedTests++; totalTests++;

    if (testTypeSerialization(
        testName,
        typeid(GENERICS_INFRA::ObjectWithGeneric).name(),
        GENERICS_INFRA::ObjectWithGeneric(),
        jInfrastructureTypesClass["objectWithGeneric"],
        false
    )) passedTests++; totalTests++;

    if (testTypeSerialization(
        testName,
        typeid(GENERICS_INFRA::IntersectedDataRetrieve).name(),
        GENERICS_INFRA::IntersectedDataRetrieve(),
        jInfrastructureTypesClass["intersectedDataRetrieve"],
        false
    )) passedTests++; totalTests++;

    if (testTypeSerialization(
        testName,
        "GENERICS_APP::UserEntities",
        GENERICS_APP::UserEntities(),
        jGenericUserEntities["normalUserEntity"],
        false
    )) passedTests++; totalTests++;

    if (testTypeSerialization(
        testName,
        "GENERICS_APP::UserEntities",
        GENERICS_APP::UserEntities(),
        jGenericUserEntities["adminUserEntity"],
        false
    )) passedTests++; totalTests++;

    std::cout << "-----------------------------------------" << std::endl;
    std::cout << (passedTests == totalTests ? "✓" : "✗") << " (" << passedTests << "/" << totalTests << ")" << std::endl;

    return passedTests == totalTests ? 0 : 1;
}