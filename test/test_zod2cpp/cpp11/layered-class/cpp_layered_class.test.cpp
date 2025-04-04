#include "user.dtos.hpp"
#include "../../cpp_test_utils.cpp"

int main() {
    if (testType(USER_DTOS::UserDtos(), jUserDtos)) {
        std::cout <<
            "C++11 - Layered Class - Test passed: " <<
            "Serialization and deserialization of UserDtos are equivalent." <<
            std::endl;
    }
    else {
        std::cerr <<
            "C++11 - Layered Class - Test failed: " <<
            "Serialization and deserialization of UserDtos are not equivalent." <<
            std::endl;
    }

    return 0;
}
