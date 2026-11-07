#!/bin/bash
for file in $(find . -type f -regex ".*cpp11/.*\.test\.cpp"); do
    dir_cpp11=$(dirname "$file")
    cd "$dir_cpp11"
    g++ -std=c++11 "$(basename "$file")" -o test.exe
    if [ $? -eq 0 ]; then
        ./test.exe
        rm test.exe
    else
        echo "C++11 build failed for $file"
    fi
    cd - > /dev/null
done

for file in $(find . -type f -regex ".*cpp17/.*\.test\.cpp"); do
    dir_cpp17=$(dirname "$file")
    cd "$dir_cpp17"
    g++ -std=c++17 "$(basename "$file")" -o test.exe
    if [ $? -eq 0 ]; then
        ./test.exe
        rm test.exe
    else
        echo "C++17 build failed for $file"
    fi
    cd - > /dev/null
done

# Issue cases: the expected headers of each case are copied with the names used by their includes.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for file in "$SCRIPT_DIR"/issues/case_*.test.cpp; do
    case_name=$(basename "$file" .test.cpp)
    case_dir="$SCRIPT_DIR/../test_issues/no_id/${case_name#case_}"
    for kind in struct class; do
        tmp_dir=$(mktemp -d)
        for header in "$case_dir/$kind-expected/"*.expected_cpp.h; do
            cp "$header" "$tmp_dir/$(basename "$header" .expected_cpp.h).hpp"
        done
        cp "$file" "$SCRIPT_DIR/cpp_test_utils.cpp" "$tmp_dir/"
        flags=""
        [ "$kind" = "class" ] && flags="-DCLASS_MODE"
        if g++ -std=c++11 $flags "$tmp_dir/$(basename "$file")" -o "$tmp_dir/test.exe"; then
            "$tmp_dir/test.exe"
        else
            echo "C++11 build failed for $file ($kind)"
        fi
        rm -rf "$tmp_dir"
    done
done
