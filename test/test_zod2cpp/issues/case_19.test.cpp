// Built by test_cpp.sh with the expected headers of test_issues/no_id/19, in struct mode and in
// class mode (CLASS_MODE).
#include "case_19.hpp"
#include "cpp_test_utils.cpp"

#ifdef CLASS_MODE
#define FIELD(x, name) (x).get_##name()
#define MODE "Class"
#else
#define FIELD(x, name) (x).name
#define MODE "Struct"
#endif

using namespace CASE_19_APP;

const json jEventLog = json::parse(R"({
    "event": {"kind": "Deleted", "id": "1", "reason": "spam"},
    "mixed": {"kind": "Archived", "id": "2"},
    "message": {"type": "Alert", "payload": {"text": "disk", "level": 3}},
    "history": [{"kind": "Created", "id": "3"}, {"kind": "Deleted", "id": "4"}],
    "last": {"kind": "Created", "id": "5"}
})");

int main() {
    std::string testName = std::string("C++11 - Issue 19 ") + MODE;
    int totalTests = 0, passedTests = 0;

    totalTests++;
    if (testTypeSerialization(testName, typeid(EventLog).name(), EventLog(), jEventLog, false)) {
        passedTests++;
    }

    // Variants are chosen by their discriminant.
    EventLog log = jEventLog.get<EventLog>();
    bool dispatched =
        FIELD(log, event).which() == 1 &&
        FIELD(log, mixed).which() == 1 &&
        FIELD(log, message).which() == 1 &&
        FIELD(log, history)[0].which() == 0 &&
        FIELD(log, history)[1].which() == 1 &&
        FIELD(log, last)->which() == 0;
    std::cout << (dispatched ? "Test passed: " : "Test failed: ") << testName
              << " - Variants dispatched by discriminant." << std::endl;
    totalTests++;
    if (dispatched) {
        passedTests++;
    }

    std::cout << "-----------------------------------------" << std::endl;
    std::cout << (passedTests == totalTests ? "✓" : "✗") << " (" << passedTests << "/" << totalTests << ")" << std::endl;

    return passedTests == totalTests ? 0 : 1;
}
