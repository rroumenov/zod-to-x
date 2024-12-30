#!/bin/bash
dir_cpp11=`dirname $(find . -name cpp_supported_schemas.test.cpp)`
cd $dir_cpp11
g++ -std=c++11 cpp_supported_schemas.test.cpp -o test.exe
if [ $? -eq 0 ]; then
    ./test.exe
    rm test.exe
else
    echo "C++11 build failed"
fi

cd ../cpp17
g++ -std=c++17 cpp_supported_schemas.test17.cpp -o test17.exe
if [ $? -eq 0 ]; then
    ./test17.exe
    rm test17.exe
else
    echo "C++17 build failed"
fi