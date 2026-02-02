import JSZip from 'jszip';
import { ThemeShape, LoginVariant, CounterStyle } from '../types';

import filesList from './archetypeFiles.json';

export const COLORS_FILENAME_MAP: Record<string, string> = {
  default: 'CHOOSE_YOUR_COLORS.xml',
  frostbite: 'CHOOSE_YOUR_COLORS_FROSTBITE.xml',
  industrial: 'CHOOSE_YOUR_COLORS_INDUSTRIAL.xml',
  rose: 'CHOOSE_YOUR_COLORS_ROSÉ.xml',
  sunrise: 'CHOOSE_YOUR_COLORS_SUNRISE.xml',
  twilight: 'CHOOSE_YOUR_COLORS_TWILIGHT.xml',
  green420: 'CHOOSE_YOUR_COLORS_420GREEN.xml',
  ember: 'CHOOSE_YOUR_COLORS_EMBER.xml'
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

export async function copyFolderRecursively(
  zip: JSZip,
  sourcePath: string,
  targetPath: string
): Promise<void> {
  const files = filesList.files;

  for (const file of files) {
    try {
      const response = await fetch(`/archetype/${file}`);
      if (!response.ok) {
        console.warn(`Could not fetch ${file}: ${response.statusText}`);
        continue;
      }

      const blob = await response.blob();
      zip.file(`${targetPath}/${file}`, blob);
    } catch (error) {
      console.warn(`Could not copy ${file}:`, error);
    }
  }

  const colorFiles = [
    'CHOOSE_YOUR_COLORS.xml',
    'CHOOSE_YOUR_COLORS_420GREEN.xml',
    'CHOOSE_YOUR_COLORS_EMBER.xml',
    'CHOOSE_YOUR_COLORS_FROSTBITE.xml',
    'CHOOSE_YOUR_COLORS_INDUSTRIAL.xml',
    'CHOOSE_YOUR_COLORS_ROSÉ.xml',
    'CHOOSE_YOUR_COLORS_SUNRISE.xml',
    'CHOOSE_YOUR_COLORS_TWILIGHT.xml'
  ];

  for (const file of colorFiles) {
    try {
      const response = await fetch(`/themes/colors/${file}`);
      if (!response.ok) {
        console.warn(`Could not fetch ${file}: ${response.statusText}`);
        continue;
      }

      const blob = await response.blob();
      zip.file(`${targetPath}/theme/${file}`, blob);
    } catch (error) {
      console.warn(`Could not copy ${file}:`, error);
    }
  }
}
