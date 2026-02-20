import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const archetypeDir = path.join(rootDir, 'public/archetype');
const themeColorsDir = path.join(rootDir, 'public/themes/colors');
const outputZipPath = path.join(rootDir, 'public/base-theme.zip');

const zip = new JSZip();

// Exclude large fonts from the base-theme.zip
// These will be fetched and added client-side to save bandwidth on the zip download
const EXCLUDED_FILES = [
  'NotoSansCJK-Bold.ttc',
  'NotoSansCJK-Medium.ttc',
  'battle.ttf'
];

function addFilesToZip(dir, zipFolder) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === '.DS_Store' || EXCLUDED_FILES.includes(file)) continue;

    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      addFilesToZip(filePath, zipFolder.folder(file));
    } else {
      const content = fs.readFileSync(filePath);
      zipFolder.file(file, content);
    }
  }
}

async function generateZip() {
  console.log('Generating base-theme.zip...');

  // Add archetype files
  if (fs.existsSync(archetypeDir)) {
    console.log(`Adding files from ${archetypeDir}...`);
    // The zip structure should have 'archetype' at the root
    addFilesToZip(archetypeDir, zip.folder('archetype'));
  } else {
    console.error(`Error: ${archetypeDir} does not exist.`);
    process.exit(1);
  }

  // Add theme color files to archetype/theme/
  if (fs.existsSync(themeColorsDir)) {
    console.log(`Adding color themes from ${themeColorsDir}...`);
    const themeFolder = zip.folder('archetype').folder('theme');

    const colorFiles = fs.readdirSync(themeColorsDir);
    for (const file of colorFiles) {
      if (file === '.DS_Store') continue;

      const filePath = path.join(themeColorsDir, file);
      if (fs.statSync(filePath).isFile()) {
        themeFolder.file(file, fs.readFileSync(filePath));
      }
    }
  }

  // Generate the zip file
  console.log('Writing zip file...');

  zip.generateNodeStream({
    type: 'nodebuffer',
    streamFiles: true,
    compression: 'DEFLATE',
    compressionOptions: {
      level: 9
    }
  })
    .pipe(fs.createWriteStream(outputZipPath))
    .on('finish', function () {
        console.log(`base-theme.zip created at ${outputZipPath}`);
    })
    .on('error', function(err) {
        console.error('Error writing zip:', err);
        process.exit(1);
    });
}

generateZip().catch(err => {
  console.error(err);
  process.exit(1);
});
