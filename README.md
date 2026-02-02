## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `pnpm install`

2. Run app:
   `pnpm dev`

Note: Archetype files are automatically prepared during installation via postinstall hook.

## Build & Export

The Build & Export feature creates a ZIP file containing Archetype theme with your custom selections. The ZIP includes:
- The entire archetype folder structure
- Modified XML files based on your choices:
  - `info.xml` - updated sprite_atlas based on theme shape
  - `theme.xml` - updated color theme reference
  - `theme/CHOOSE_YOUR_LOOK.xml` - updated includes for login, cursor, shape, and bubble
  - `theme/CHOOSE_YOUR_COUNTER.xml` - updated counter style

The ZIP is named `archetype-[theme-name].zip` and automatically downloads when you click "Build & Export".
