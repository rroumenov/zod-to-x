#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Change to project root
cd "$PROJECT_ROOT"

# Activate virtual environment if it exists
if [ -d "./venv/bin" ]; then
    source ./venv/bin/activate
fi

# Change to test directory
cd "$SCRIPT_DIR"

for file in $(find . -type f -name "*_test.py"); do
    echo "Running $file..."
    python "$file"
    if [ $? -ne 0 ]; then
        echo "Test failed for $file"
        exit 1
    fi
done

echo "All Python tests passed!"
