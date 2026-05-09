#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

TMPDIR_BASE=$(mktemp -d)
trap "rm -rf $TMPDIR_BASE" EXIT

run_go_test() {
    local dir="$1"
    local label="$2"
    echo "--- $label ---"
    cd "$dir"
    go mod tidy -e 2>/dev/null || true
    go test -v ./...
    cd - > /dev/null
    echo ""
}

# ─── Module 1: Flat GoSupportedSchemas ───────────────────────────────────────
TMPDIR_FLAT="$TMPDIR_BASE/flat"
mkdir -p "$TMPDIR_FLAT"
cp "$SCRIPT_DIR/struct-expected/go_supported_schemas.go" "$TMPDIR_FLAT/"
cp "$SCRIPT_DIR/go_test_utils_test.go"                   "$TMPDIR_FLAT/"
cp "$SCRIPT_DIR/go_supported_schemas_test.go"            "$TMPDIR_FLAT/"
cp "$SCRIPT_DIR/go_discriminated_union_test.go"          "$TMPDIR_FLAT/"
cat > "$TMPDIR_FLAT/go.mod" << 'EOF'
module models
go 1.21
EOF
run_go_test "$TMPDIR_FLAT" "Flat GoSupportedSchemas"

# ─── Module 2: Layered Entity GoSupportedSchemas ─────────────────────────────
TMPDIR_ENTITY="$TMPDIR_BASE/entity"
mkdir -p "$TMPDIR_ENTITY"
cp "$SCRIPT_DIR/struct-expected/go_supported_schemas_entity.go" "$TMPDIR_ENTITY/"
cp "$SCRIPT_DIR/go_test_utils_test.go"                          "$TMPDIR_ENTITY/"
cp "$SCRIPT_DIR/go_layered_entity_test.go"                      "$TMPDIR_ENTITY/"
cat > "$TMPDIR_ENTITY/go.mod" << 'EOF'
module models
go 1.21
EOF
run_go_test "$TMPDIR_ENTITY" "Layered Entity GoSupportedSchemas"

# ─── Module 3: Layered App GoSupportedSchemasApplication ─────────────────────
# Generated file uses `import GO_SUPPORTED_SCHEMAS "./go_supported_schemas_entity"`.
# Rewrite to module name and add replace directive.
TMPDIR_APP="$TMPDIR_BASE/app"
ENTITY_SUBMOD_APP="$TMPDIR_APP/go_supported_schemas_entity"
mkdir -p "$ENTITY_SUBMOD_APP"
cp "$SCRIPT_DIR/struct-expected/go_supported_schemas_entity.go" "$ENTITY_SUBMOD_APP/"
cat > "$ENTITY_SUBMOD_APP/go.mod" << 'EOF'
module go_supported_schemas_entity
go 1.21
EOF
sed 's|"./go_supported_schemas_entity"|"go_supported_schemas_entity"|g' \
    "$SCRIPT_DIR/struct-expected/go_supported_schemas_app.go" > "$TMPDIR_APP/go_supported_schemas_app.go"
cp "$SCRIPT_DIR/go_test_utils_test.go"  "$TMPDIR_APP/"
cp "$SCRIPT_DIR/go_layered_app_test.go" "$TMPDIR_APP/"
cat > "$TMPDIR_APP/go.mod" << 'EOF'
module models
go 1.21

require go_supported_schemas_entity v0.0.0

replace go_supported_schemas_entity => ./go_supported_schemas_entity
EOF
run_go_test "$TMPDIR_APP" "Layered App GoSupportedSchemasApplication"

# ─── Module 4: User Domain Entity ────────────────────────────────────────────
TMPDIR_USER_ENTITY="$TMPDIR_BASE/user_entity"
mkdir -p "$TMPDIR_USER_ENTITY"
cp "$SCRIPT_DIR/struct-expected/user.entity.go" "$TMPDIR_USER_ENTITY/"
cp "$SCRIPT_DIR/go_test_utils_test.go"          "$TMPDIR_USER_ENTITY/"
cp "$SCRIPT_DIR/go_user_entity_test.go"         "$TMPDIR_USER_ENTITY/"
cat > "$TMPDIR_USER_ENTITY/go.mod" << 'EOF'
module models
go 1.21
EOF
run_go_test "$TMPDIR_USER_ENTITY" "User Domain Entity"

# ─── Module 5: User DTOs (cross-layer, imports user.entity) ──────────────────
TMPDIR_USER_DTOS="$TMPDIR_BASE/user_dtos"
USER_ENTITY_SUB="$TMPDIR_USER_DTOS/user_entity"
mkdir -p "$USER_ENTITY_SUB"
cp "$SCRIPT_DIR/struct-expected/user.entity.go" "$USER_ENTITY_SUB/"
cat > "$USER_ENTITY_SUB/go.mod" << 'EOF'
module user_entity
go 1.21
EOF
sed 's|"./user.entity"|"user_entity"|g' \
    "$SCRIPT_DIR/struct-expected/user.dtos.go" > "$TMPDIR_USER_DTOS/user.dtos.go"
cp "$SCRIPT_DIR/go_test_utils_test.go"  "$TMPDIR_USER_DTOS/"
cp "$SCRIPT_DIR/go_user_dtos_test.go"   "$TMPDIR_USER_DTOS/"
cat > "$TMPDIR_USER_DTOS/go.mod" << 'EOF'
module models
go 1.21

require user_entity v0.0.0

replace user_entity => ./user_entity
EOF
run_go_test "$TMPDIR_USER_DTOS" "User DTOs"

# ─── Module 6: User API (imports user.dtos → user.entity) ────────────────────
# user_entity is placed as a sibling of user_dtos so user_dtos/go.mod can reach
# it via `replace user_entity => ../user_entity`.
TMPDIR_USER_API="$TMPDIR_BASE/user_api"
USER_DTOS_SUB="$TMPDIR_USER_API/user_dtos"
USER_ENTITY_SIBLING="$TMPDIR_USER_API/user_entity"
mkdir -p "$USER_DTOS_SUB" "$USER_ENTITY_SIBLING"

# user_entity sub-module (sibling of user_dtos)
cp "$SCRIPT_DIR/struct-expected/user.entity.go" "$USER_ENTITY_SIBLING/"
cat > "$USER_ENTITY_SIBLING/go.mod" << 'EOF'
module user_entity
go 1.21
EOF

# user.dtos.go: rewrite "./user.entity" → "user_entity"
sed 's|"./user.entity"|"user_entity"|g' \
    "$SCRIPT_DIR/struct-expected/user.dtos.go" > "$USER_DTOS_SUB/user.dtos.go"
cat > "$USER_DTOS_SUB/go.mod" << 'EOF'
module user_dtos
go 1.21

require user_entity v0.0.0

replace user_entity => ../user_entity
EOF

# user.api.go: rewrite "./user.dtos" → "user_dtos"
sed 's|"./user.dtos"|"user_dtos"|g' \
    "$SCRIPT_DIR/struct-expected/user.api.go" > "$TMPDIR_USER_API/user.api.go"
cp "$SCRIPT_DIR/go_test_utils_test.go"  "$TMPDIR_USER_API/"
cp "$SCRIPT_DIR/go_user_api_test.go"    "$TMPDIR_USER_API/"
cat > "$TMPDIR_USER_API/go.mod" << 'EOF'
module models
go 1.21

require user_dtos v0.0.0
require user_entity v0.0.0

replace user_dtos => ./user_dtos
replace user_entity => ./user_entity
EOF
run_go_test "$TMPDIR_USER_API" "User API"

# ─── Module 7: Layered Generics (app + infra) ────────────────────────────────
TMPDIR_GENERICS="$TMPDIR_BASE/generics"
GENERICS_APP_SUB="$TMPDIR_GENERICS/generics_app"
mkdir -p "$GENERICS_APP_SUB"
cp "$SCRIPT_DIR/struct-expected/layered_generics.app.go" "$GENERICS_APP_SUB/"
cat > "$GENERICS_APP_SUB/go.mod" << 'EOF'
module generics_app
go 1.21
EOF

# Rewrite "./layered_generics.app" → "generics_app"
sed 's|"./layered_generics.app"|"generics_app"|g' \
    "$SCRIPT_DIR/struct-expected/layered_generics.infra.go" > "$TMPDIR_GENERICS/layered_generics.infra.go"
cp "$SCRIPT_DIR/go_test_utils_test.go"         "$TMPDIR_GENERICS/"
cp "$SCRIPT_DIR/go_layered_generics_test.go"   "$TMPDIR_GENERICS/"
cat > "$TMPDIR_GENERICS/go.mod" << 'EOF'
module models
go 1.21

require generics_app v0.0.0

replace generics_app => ./generics_app
EOF
run_go_test "$TMPDIR_GENERICS" "Layered Generics"

echo "All Go native tests passed!"
