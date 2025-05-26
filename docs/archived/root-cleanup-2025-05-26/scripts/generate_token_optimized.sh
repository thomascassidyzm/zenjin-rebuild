#!/bin/bash
# Script to generate token-optimized APML from standard APML
# Usage: ./generate_token_optimized.sh path/to/standard.apml path/to/output/token-optimized.apml

# Check if input and output paths were provided
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Error: Input and output paths required"
    echo "Usage: ./generate_token_optimized.sh path/to/standard.apml path/to/output/token-optimized.apml"
    exit 1
fi

INPUT_PATH=$1
OUTPUT_PATH=$2

# Check if input file exists
if [ ! -f "$INPUT_PATH" ]; then
    echo "Error: Input file not found at $INPUT_PATH"
    exit 1
fi

echo "Generating token-optimized APML from $INPUT_PATH to $OUTPUT_PATH..."

# Create a temporary file for processing
TEMP_FILE=$(mktemp)

# Apply optimization transformations
cat "$INPUT_PATH" | \
# Transform Component tags
sed 's/<Component /<C /g' | \
sed 's/<\/Component>/<\/C>/g' | \
# Transform Purpose tags (convert to attributes)
sed -E 's/<Purpose>([^<]+)<\/Purpose>/purpose="\1"/g' | \
# Transform ContextBoundary tags
sed 's/<ContextBoundary /<CB /g' | \
sed 's/<\/ContextBoundary>/<\/CB>/g' | \
# Transform size attribute to contextSize
sed 's/size="/contextSize="/g' | \
# Transform tokenEstimate to tokens
sed 's/tokenEstimate="/tokens="/g' | \
# Transform Interface tags
sed 's/<Interface /<I /g' | \
sed 's/<\/Interface>/<\/I>/g' | \
# Transform Input tags
sed 's/<Input /<In /g' | \
sed 's/<\/Input>/<\/In>/g' | \
# Transform Output tags
sed 's/<Output /<Out /g' | \
sed 's/<\/Output>/<\/Out>/g' | \
# Transform required attribute to req
sed 's/required="/req="/g' | \
# Transform ValidationCriteria tags
sed 's/<ValidationCriteria>/<VC>/g' | \
sed 's/<\/ValidationCriteria>/<\/VC>/g' | \
# Transform Criterion tags
sed 's/<Criterion /<V /g' | \
sed 's/<\/Criterion>/<\/V>/g' | \
# Transform Description tags (convert to attributes where possible)
sed -E 's/<Description>([^<]+)<\/Description>/desc="\1"/g' | \
# Remove excessive whitespace
sed 's/  / /g' | \
# Remove blank lines
sed '/^$/d' > "$TEMP_FILE"

# Move the temp file to the output location
mv "$TEMP_FILE" "$OUTPUT_PATH"

echo "Token-optimized APML generated successfully at $OUTPUT_PATH"
echo "Original file size: $(wc -c < "$INPUT_PATH") bytes"
echo "Optimized file size: $(wc -c < "$OUTPUT_PATH") bytes"
echo "Size reduction: $(( 100 - ($(wc -c < "$OUTPUT_PATH") * 100 / $(wc -c < "$INPUT_PATH")) ))%"