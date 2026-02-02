
import { ColorTheme, CursorSet, BubbleSet, CounterStyle, LoginVariant } from './types';

export const LOGIN_VARIANTS: { id: LoginVariant; name: string }[] = [
  { id: 'Unova', name: 'Unova' },
  { id: 'Allstars', name: 'Allstars' },
  { id: 'Default', name: 'Default' },
];

export const COUNTER_STYLES: CounterStyle[] = [
  'Counter-Minimal-Right-Icon',
  'Counter-Minimal-Right',
  'Counter-Right-Icon',
  'Counter-Right',
  'Counter-Minimal-Left-Icon',
  'Counter-Minimal-Left',
  'Counter-Left-Icon',
  'Counter-Left',
  'Counter-Vartiou',
  'None'
];

export const COLOR_THEMES: ColorTheme[] = [
  { 
    id: 'default', 
    name: 'Original', 
    description: 'The original theme',
    hex: '#42b9ff', 
    sub: '#1c2328', 
    textOnMain: '#000000',
    textOnSub: '#ffffff',
    hpHigh: '#82e026', 
    xp: '#2eb2f8', 
    friendship: '#b61ae8', 
    glow: 'rgba(66, 185, 255, 0.4)', 
    previewImage: 'defaultgame.png',
  },
  { 
    id: 'frostbite', 
    name: 'Frostbite', 
    description: 'A variant created by Bahbus',
    hex: '#4F6D88', 
    sub: '#DDE7E4', 
    textOnMain: '#ffffff',
    textOnSub: '#0D1418',
    hpHigh: '#3AD48F', 
    xp: '#4A8FD1', 
    friendship: '#C586F5', 
    glow: 'rgba(79, 109, 136, 0.4)', 
    previewImage: 'frostbitegame.png',
  },
  { 
    id: 'industrial', 
    name: 'Industrial', 
    description: 'A variant created by Bahbus',
    hex: '#3A444F', 
    sub: '#11141A', 
    textOnMain: '#E0E4E8', 
    textOnSub: '#A4AAB0', 
    hpHigh: '#3DBA5F', 
    xp: '#4D82C2', 
    friendship: '#B57BBF', 
    glow: 'rgba(58, 68, 79, 0.4)', 
    previewImage: 'industrialgame.png',
  },
  { 
    id: 'rose', 
    name: 'Rosé', 
    description: 'A variant created by Bahbus',
    hex: '#C1607D', 
    sub: '#F5ECE9', 
    textOnMain: '#ffffff', 
    textOnSub: '#77505C', 
    hpHigh: '#4CC773', 
    xp: '#6994D9', 
    friendship: '#F073AF', 
    glow: 'rgba(193, 96, 125, 0.4)', 
    previewImage: 'rosegame.png',
  },
  { 
    id: 'sunrise', 
    name: 'Sunrise', 
    description: 'A variant created by Bahbus',
    hex: '#D98742', 
    sub: '#EAE3D2', 
    textOnMain: '#1E1A12', 
    textOnSub: '#5C4F2B', 
    hpHigh: '#2EBA4A', 
    xp: '#4A7FBF', 
    friendship: '#E86AA2', 
    glow: 'rgba(217, 135, 66, 0.4)', 
    previewImage: 'sunrisegame.png',
  },
  { 
    id: 'twilight', 
    name: 'Twilight', 
    description: 'A variant created by Bahbus',
    hex: '#352D4F', 
    sub: '#0A0810', 
    textOnMain: '#EAE6F2', 
    textOnSub: '#BFB4C9', 
    hpHigh: '#3CCB6A', 
    xp: '#5C7CCF', 
    friendship: '#C372C6', 
    glow: 'rgba(53, 45, 79, 0.4)', 
    previewImage: 'twilightgame.png',
  },
  { 
    id: 'green420', 
    name: '420 Green', 
    description: 'A variant created by Bahbus',
    hex: '#1F5D2E', 
    sub: '#0A0F0C', 
    textOnMain: '#ffffff',
    textOnSub: '#C5D1C8',
    hpHigh: '#3ED46A', 
    xp: '#2E9BCF', 
    friendship: '#C86AC2', 
    glow: 'rgba(31, 93, 46, 0.4)', 
    previewImage: '420greengame.png',
  },
  { 
    id: 'ember', 
    name: 'Ember', 
    description: 'A variant created by Bahbus',
    hex: '#B44527', 
    sub: '#121010', 
    textOnMain: '#F7E7D1',
    textOnSub: '#D4B9A5',
    hpHigh: '#39B05A', 
    xp: '#5B86D4', 
    friendship: '#E379A8', 
    glow: 'rgba(180, 69, 39, 0.4)', 
    previewImage: 'embergame.png',
  },
];

export const CURSOR_SETS: CursorSet[] = [
  {
    id: 'classic-white',
    name: 'Classic White',
    file: 'cursors-white.png',
    isModern: false,
    isDark: false,
    sprite: { x: 3, y: 21, w: 15, h: 23, hotX: 1, hotY: 2 }
  },
  {
    id: 'classic-black',
    name: 'Classic Black',
    file: 'cursors-black.png',
    isModern: false,
    isDark: true,
    sprite: { x: 3, y: 21, w: 15, h: 23, hotX: 1, hotY: 2 }
  },
  {
    id: 'modern-white',
    name: 'Modern White',
    file: 'modern-cursors-white.png',
    isModern: true,
    isDark: false,
    sprite: { x: 3, y: 21, w: 15, h: 23, hotX: 1, hotY: 2 }
  },
  {
    id: 'modern-black',
    name: 'Modern Black',
    file: 'modern-cursors-black.png',
    isModern: true,
    isDark: true,
    sprite: { x: 3, y: 21, w: 15, h: 23, hotX: 1, hotY: 2 }
  },
];

export const BUBBLE_SETS: BubbleSet[] = [
  {
    id: 'archetype',
    name: 'Archetype',
    textColor: 'inherit',
    isCustom: true,
  },
  {
    id: 'default-white',
    name: 'Default White',
    textColor: '#222222',
  },
  {
    id: 'default-black',
    name: 'Default Black',
    textColor: '#ffffff',
  }
];