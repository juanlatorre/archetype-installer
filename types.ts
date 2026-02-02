
export type ThemeShape = 'Round' | 'Sharp';
export type CounterStyle = 
  | 'Counter-Minimal-Right-Icon'
  | 'Counter-Minimal-Right'
  | 'Counter-Right-Icon'
  | 'Counter-Right'
  | 'Counter-Minimal-Left-Icon'
  | 'Counter-Minimal-Left'
  | 'Counter-Left-Icon'
  | 'Counter-Left'
  | 'Counter-Vartiou'
  | 'None';

export type LoginVariant = 'Unova' | 'Allstars' | 'Default';

export interface ColorTheme {
  id: string;
  name: string;
  description?: string;
  hex: string;           // main-color (accent)
  sub: string;           // sub-color (background)
  textOnMain: string;    // font-main-color (text color when on top of main accent)
  textOnSub: string;     // font-sub-color (text color when on top of sub background)
  hpHigh: string;        // hp-high-color
  xp: string;            // xp-color
  friendship: string;     // friendship-color
  glow: string;
  previewImage: string;
}

export interface CursorSet {
  id: string;
  name: string;
  file: string;
  isModern: boolean;
  isDark: boolean;
  sprite: {
    x: number;
    y: number;
    w: number;
    h: number;
    hotX: number;
    hotY: number;
  };
}

export interface BubbleSet {
  id: string;
  name: string;
  textColor: string;
  isCustom?: boolean;
}

export interface IconItem {
  id: string;
  icon: string;
}

export interface AppState {
  activeTheme: ColorTheme;
  activeShape: ThemeShape;
  activeCursorSet: string;
  activeBubbleSet: string;
  activeCounterStyle: CounterStyle;
  activeLoginVariant: LoginVariant;
  archetypeInfo?: {
    commit: string;
    time: string;
    repoUrl: string;
  };
}