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