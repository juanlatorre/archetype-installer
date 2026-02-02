#!/bin/bash

echo "Generating archetype files manifest..."

cd public
find archetype -type f ! -name '.DS_Store' | sed 's/^archetype\///g' | sort | awk 'BEGIN {print "{\n  \"files\": ["} NR==1 {printf "    \"%s\"", $0} NR>1 {printf ",\n    \"%s\"", $0} END {print "\n  ]\n}"}' > ../utils/archetypeFiles.json
cd ..

echo "Generating archetype info..."

if [ -f "archetype-config.json" ]; then
  ARCHETYPE_COMMIT=$(node -e "console.log(require('./archetype-config.json').archetypeRepo.commit)")
  ARCHETYPE_DATE=$(node -e "console.log(require('./archetype-config.json').archetypeRepo.commitDate)")
  ARCHETYPE_REPO=$(node -e "console.log(require('./archetype-config.json').archetypeRepo.url)")
  echo "{\"commit\":\"$ARCHETYPE_COMMIT\",\"commitDate\":\"$ARCHETYPE_DATE\",\"repoUrl\":\"$ARCHETYPE_REPO\"}" > archetype-info.json
  echo "Archetype info generated: commit $ARCHETYPE_COMMIT"
else
  echo "Warning: archetype-config.json not found, skipping archetype info generation"
fi

echo "Done! Manifest generated."
