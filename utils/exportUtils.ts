import JSZip from 'jszip';
import { ThemeShape, LoginVariant, CounterStyle } from '../types';

export const COLORS_FILENAME_MAP: Record<string, string> = {
  default: 'CHOOSE_YOUR_COLORS.xml',
  'original-red': 'CHOOSE_YOUR_COLORS_ORIGINAL_RED.xml',
  'original-green': 'CHOOSE_YOUR_COLORS_ORIGINAL_GREEN.xml',
  'original-yellow': 'CHOOSE_YOUR_COLORS_ORIGINAL_YELLOW.xml',
  'original-purple': 'CHOOSE_YOUR_COLORS_ORIGINAL_PURPLE.xml',
  'original-pink': 'CHOOSE_YOUR_COLORS_ORIGINAL_PINK.xml',
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

export async function fetchBaseTheme(commitHash?: string): Promise<JSZip> {
  const url = commitHash ? `/base-theme.zip?v=${commitHash}` : '/base-theme.zip';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch base theme: ${response.statusText}`);
  }
  const blob = await response.blob();
  return JSZip.loadAsync(blob);
}
