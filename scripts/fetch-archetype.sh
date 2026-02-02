#!/bin/bash
set -e  # Exit on error

ARCHETYPE_CONFIG="archetype-config.json"
REPO_URL=$(node -e "console.log(require('./$ARCHETYPE_CONFIG').archetypeRepo.url)")
TEMP_DIR=$(mktemp -d)

echo "Fetching archetype from $REPO_URL..."

# Clone to temp directory
git clone "$REPO_URL" "$TEMP_DIR"

# Get latest commit info
cd "$TEMP_DIR"
COMMIT=$(git rev-parse HEAD)
COMMIT_DATE=$(git log -1 --format=%ci)
cd -

echo "Cloned commit: $COMMIT ($COMMIT_DATE)"

# Remove .git folder and .gitignore
rm -rf "$TEMP_DIR/.git"
rm -f "$TEMP_DIR/.gitignore"

# Move contents to public/archetype (overrides everything)
rm -rf public/archetype
mkdir -p public
mv "$TEMP_DIR" public/archetype

# Bump revision number in info.xml
sed -i.bak 's/theme_revision="5"/theme_revision="6"/' public/archetype/info.xml
rm -f public/archetype/info.xml.bak

# Update archetype-config.json with new commit info
node -e "
const config = require('./$ARCHETYPE_CONFIG');
config.archetypeRepo.commit = '$COMMIT';
config.archetypeRepo.commitDate = '$COMMIT_DATE';
require('fs').writeFileSync('./$ARCHETYPE_CONFIG', JSON.stringify(config, null, 2));
"

# Clean up temp directory
rm -rf "$TEMP_DIR"

# Generate file manifest
./generate-files.sh

echo "Archetype updated successfully!"
