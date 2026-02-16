import React from 'react';
import { ImageDefinition } from '../utils/themeParser';

export const ThemeContext = React.createContext<{
  colors: Map<string, string>;
  images: Map<string, ImageDefinition>;
  dimensions: Map<string, { w: number; h: number }>;
  processedImages: Map<string, string>;
}>({ colors: new Map(), images: new Map(), dimensions: new Map(), processedImages: new Map() });
