#!/bin/bash
set -e  # Exit on error

ARCHETYPE_CONFIG="archetype-config.json"
REPO_URL=$(node -e "console.log(require('./$ARCHETYPE_CONFIG').archetypeRepo.url)")
TEMP_DIR=$(mktemp -d)

echo "Fetching archetype from $REPO_URL..."

git clone "$REPO_URL" "$TEMP_DIR"

cd "$TEMP_DIR"
COMMIT=$(git rev-parse HEAD)
COMMIT_DATE=$(git log -1 --format=%ci)
cd -

echo "Cloned commit: $COMMIT ($COMMIT_DATE)"

# Remove .git folder and .gitignore
rm -rf "$TEMP_DIR/.git"
rm -f "$TEMP_DIR/.gitignore"

# Check if this is new layout (archetype-theme folder exists)
if [ -d "$TEMP_DIR/archetype-theme" ]; then
  echo "Detected new modular layout..."
  
  # Move archetype-theme contents to public/archetype
  rm -rf public/archetype
  mkdir -p public/archetype
  mv "$TEMP_DIR/archetype-theme"/* public/archetype/
  
  # Save icon packs
  mkdir -p public/icon-packs
  for pack in archetype-rounded-icons archetype-square-icons archetype-rounded-outeline-icons archetype-square-outeline-icons; do
    if [ -d "$TEMP_DIR/$pack" ]; then
      pack_name=$(echo "$pack" | sed 's/archetype-//')
      mkdir -p "public/icon-packs/$pack_name"
      if [ -f "$TEMP_DIR/$pack/data/sprites/atlas/main.png" ]; then
        cp "$TEMP_DIR/$pack/data/sprites/atlas/main.png" "public/icon-packs/$pack_name/"
        echo "  Saved icon pack: $pack_name"
      fi
    fi
  done
else
  echo "Detected old monolithic layout..."
  # Old layout: move everything to public/archetype
  rm -rf public/archetype
  mkdir -p public
  mv "$TEMP_DIR" public/archetype
fi

# Update archetype-config.json with new commit info
node -e "
const config = require('./$ARCHETYPE_CONFIG');
config.archetypeRepo.commit = '$COMMIT';
config.archetypeRepo.commitDate = '$COMMIT_DATE';
require('fs').writeFileSync('./$ARCHETYPE_CONFIG', JSON.stringify(config, null, 2));
"

# Generate file manifest
./generate-files.sh

# Generate base theme zip
node scripts/generate-zip.js

echo "Archetype updated successfully!"
