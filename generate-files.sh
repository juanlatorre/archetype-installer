#!/bin/bash

echo "Generating archetype files manifest..."

cd public
find archetype -type f ! -name '.DS_Store' | sed 's/^archetype\///g' | sort | awk 'BEGIN {print "{\n  \"files\": ["} NR==1 {printf "    \"%s\"", $0} NR>1 {printf ",\n    \"%s\"", $0} END {print "\n  ]\n}"}' > ../utils/archetypeFiles.json

echo "Done! Manifest generated."
