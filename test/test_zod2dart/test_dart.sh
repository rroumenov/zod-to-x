#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PKG_DIR="$SCRIPT_DIR/dart_test_pkg"
EXPECTED_DIR="$SCRIPT_DIR/class-expected"

# Install dependencies once into the persistent test package.
cd "$PKG_DIR"
if [ ! -f ".dart_tool/package_config.json" ]; then
    echo "--- Installing Dart dependencies (first run) ---"
    dart pub get
    echo ""
fi

run_dart_test() {
    local label="$1"
    local test_file="$2"
    shift 2
    local files=("$@")

    echo "--- $label ---"

    # Repopulate lib/ with only the files for this test
    rm -rf lib
    mkdir lib
    for f in "${files[@]}"; do
        cp "$EXPECTED_DIR/$f" lib/
    done

    dart run build_runner build 2>&1
    dart analyze lib/ 2>&1
    dart test "test/$test_file" 2>&1
    echo ""
}

# Issue cases: each "expected:file" pair copies an expected file of the case with the name used
# by its part and import directives.
run_dart_issue_test() {
    local label="$1"
    local test_file="$2"
    local case_dir="$SCRIPT_DIR/../test_issues/no_id/$3/class-expected"
    shift 3

    echo "--- $label ---"

    rm -rf lib
    mkdir lib
    for pair in "$@"; do
        cp "$case_dir/${pair%%:*}" "lib/${pair#*:}"
    done

    dart run build_runner build 2>&1
    dart analyze lib/ 2>&1
    dart test "test/$test_file" 2>&1
    echo ""
}

# ── Test modules ──────────────────────────────────────────────────────────────

run_dart_test "Flat DartSupportedSchemas" "dart_supported_schemas_test.dart" \
    "dart_supported_schemas.dart"

run_dart_test "User entity" "user_entity_test.dart" \
    "user.entity.dart"

run_dart_test "User DTOs (entity + dtos)" "user_dtos_test.dart" \
    "user.entity.dart" "user.dtos.dart"

run_dart_test "User API (entity + dtos + api)" "user_api_test.dart" \
    "user.entity.dart" "user.dtos.dart" "user.api.dart"

run_dart_test "Layered entity DartSupportedSchemas" "dart_supported_schemas_entity_test.dart" \
    "dart_supported_schemas_entity.dart"

run_dart_test "Layered app DartSupportedSchemas" "dart_supported_schemas_app_test.dart" \
    "dart_supported_schemas_entity.dart" "dart_supported_schemas_app.dart"

run_dart_test "Generics Application" "layered_generics_app_test.dart" \
    "layered_generics.app.dart"

run_dart_test "Generics Infrastructure (app + infra)" "layered_generics_infra_test.dart" \
    "layered_generics.app.dart" "layered_generics.infra.dart"

run_dart_issue_test "Issue case 19 (domain + app)" "case_19_test.dart" 19 \
    "case_19_domain.expected_dart.dart:case_19_domain.dart" \
    "case_19.expected_dart.dart:case_19_app.dart"

run_dart_issue_test "Issue case 20 (domain + app)" "case_20_test.dart" 20 \
    "case_20_domain.expected_dart.dart:case_20_domain.dart" \
    "case_20.expected_dart.dart:case_20_app.dart"

# Clean up lib/ after tests
rm -rf lib

echo "All Dart tests passed."
