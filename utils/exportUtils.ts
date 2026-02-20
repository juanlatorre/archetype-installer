import JSZip from 'jszip';
import { ThemeShape, LoginVariant, CounterStyle } from '../types';

export const COLORS_FILENAME_MAP: Record<string, string> = {
  default: 'CHOOSE_YOUR_COLORS.xml',
  frostbite: 'CHOOSE_YOUR_COLORS_FROSTBITE.xml',
  industrial: 'CHOOSE_YOUR_COLORS_INDUSTRIAL.xml',
  rose: 'CHOOSE_YOUR_COLORS_ROSÉ.xml',
  sunrise: 'CHOOSE_YOUR_COLORS_SUNRISE.xml',
  twilight: 'CHOOSE_YOUR_COLORS_TWILIGHT.xml',
  green420: 'CHOOSE_YOUR_COLORS_420GREEN.xml',
  ember: 'CHOOSE_YOUR_COLORS_EMBER.xml',
  arcticwhite: 'CHOOSE_YOUR_COLORS_ARCTICWHITE.xml'
};

export function getColorsFilename(themeId: string): string {
  return COLORS_FILENAME_MAP[themeId] || 'CHOOSE_YOUR_COLORS.xml';
}

export function getShapeInclude(shape: ThemeShape): string {
  return shape === 'Round' ? 'Round' : 'Sharp';
}

export function getShapeAtlas(shape: ThemeShape): string {
  return shape === 'Round' ? 'icons/round/main.atlas' : 'icons/sharp/main.atlas';
}

export function getLoginInclude(loginVariant: LoginVariant): string {
  return loginVariant;
}

export function getCursorInclude(cursorId: string): string {
  const cursorMap: Record<string, string> = {
    'classic-white': 'Cursors-White',
    'classic-black': 'Cursors-Black',
    'modern-white': 'Cursors-White-Alt',
    'modern-black': 'Cursors-Black-Alt'
  };
  return cursorMap[cursorId] || 'Cursors-White';
}

export function getBubbleInclude(bubbleId: string): string {
  const bubbleMap: Record<string, string> = {
    'archetype': 'Archetype',
    'default-white': 'Default-White',
    'default-black': 'Default-Black'
  };
  return bubbleMap[bubbleId] || 'Archetype';
}

export function getCounterInclude(counterStyle: CounterStyle): string {
  if (counterStyle === 'None') return 'Counter-Right';
  return counterStyle;
}

async function fetchAndAddFile(zip: JSZip, url: string, pathInZip: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}`);
    const blob = await response.blob();
    zip.file(pathInZip, blob);
  } catch (error) {
    console.error(`Error adding file ${pathInZip} to zip:`, error);
    // Proceeding without the file might be better than failing the whole download,
    // but for fonts it's critical. However, throwing here stops the whole process.
    throw error;
  }
}

export async function fetchBaseTheme(): Promise<JSZip> {
  // Fetch the lightweight base theme zip
  const response = await fetch('/base-theme.zip');
  if (!response.ok) {
    throw new Error(`Failed to fetch base theme: ${response.statusText}`);
  }
  const blob = await response.blob();
  const zip = await JSZip.loadAsync(blob);

  // Fetch and add the excluded fonts
  // These are hosted as static files in public/archetype/...
  // We need to fetch them and add them to the zip structure
  const fontBaseUrl = '/archetype/theme/assets/jaejGI7pIp/fonts';
  const fonts = [
    'NotoSansCJK-Bold.ttc',
    'NotoSansCJK-Medium.ttc',
    'battle.ttf'
  ];

  await Promise.all(fonts.map(font =>
    fetchAndAddFile(zip, `${fontBaseUrl}/${font}`, `archetype/theme/assets/jaejGI7pIp/fonts/${font}`)
  ));

  return zip;
}
