## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `pnpm install`

   This creates a bundled local snapshot fallback of Archetype files.

2. Run app:
   `pnpm dev`

### Manual Archetype Update

To manually update Archetype files without reinstalling dependencies:
```bash
npm run fetch-archetype
```

The app now fetches the latest upstream Archetype default branch and commit at runtime for export. The bundled files are only used as a fallback when GitHub is unavailable.

## Color Themes

Custom color themes are stored in `public/themes/colors/`. These files are manually managed and not affected by automatic Archetype updates.

To add or modify a color theme:
1. Edit or create XML files in `public/themes/colors/`
2. The file name must match the pattern: `CHOOSE_YOUR_COLORS_*.xml`
3. Update `constants.ts` to register the new theme

## Build & Export

The Build & Export feature creates a ZIP file containing Archetype theme with your custom selections. The ZIP includes:
- The entire archetype folder structure
- Custom color themes from `public/themes/colors/`
- Modified XML files based on your choices:
  - `info.xml` - updated sprite_atlas based on theme shape
  - `theme.xml` - updated color theme reference
  - `theme/CHOOSE_YOUR_LOOK.xml` - updated includes for login, cursor, shape, and bubble
  - `theme/CHOOSE_YOUR_COUNTER.xml` - updated counter style

The ZIP is named `archetype-[theme-name].zip` and automatically downloads when you click "Build & Export".
