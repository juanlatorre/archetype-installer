import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const archetypeDir = path.join(rootDir, 'public/archetype');
const iconPacksDir = path.join(rootDir, 'public/icon-packs');
const themeColorsDir = path.join(rootDir, 'public/themes/colors');
const outputZipPath = path.join(rootDir, 'public/base-theme.zip');

const zip = new JSZip();

function addFilesToZip(dir, zipFolder) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === '.DS_Store') continue;
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
  
  if (fs.existsSync(archetypeDir)) {
    console.log(`Adding files from ${archetypeDir}...`);
    addFilesToZip(archetypeDir, zip.folder('archetype'));
  } else {
    console.error(`Error: ${archetypeDir} does not exist.`);
    process.exit(1);
  }
  
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
  
  if (fs.existsSync(iconPacksDir)) {
    console.log(`Adding icon packs from ${iconPacksDir}...`);
    const packDirs = fs.readdirSync(iconPacksDir);
    for (const packDir of packDirs) {
      if (packDir === '.DS_Store') continue;
      const packPath = path.join(iconPacksDir, packDir);
      if (!fs.statSync(packPath).isDirectory()) continue;
      const atlasFile = path.join(packPath, 'main.png');
      if (fs.existsSync(atlasFile)) {
        const atlasContent = fs.readFileSync(atlasFile);
        const atlasPathInZip = `archetype/icon-packs/${packDir}/main.png`;
        zip.file(atlasPathInZip, atlasContent);
        console.log(`  Added icon pack: ${packDir}`);
      }
    }
  }
  
  console.log('Writing zip file...');
  zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
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
