import React, { useEffect, useState, useContext, useMemo } from 'react';
import { AppState, ColorTheme } from '../types';
import { loadThemeColors, loadBattleImages, ImageDefinition } from '../utils/themeParser';

interface BattlePreviewProps {
  state: AppState;
}

const ThemeContext = React.createContext<{
  colors: Map<string, string>;
  images: Map<string, ImageDefinition>;
  dimensions: Map<string, { w: number; h: number }>;
  processedImages: Map<string, string>;
}>({ colors: new Map(), images: new Map(), dimensions: new Map(), processedImages: new Map() });

// Helper to resolve color variable or return raw string
const resolveColor = (color: string | undefined, colors: Map<string, string>): string | undefined => {
  if (!color) return undefined;
  if (color.startsWith('#')) return color;
  return colors.get(color) || color;
};

interface ThemedImageProps {
  name?: string;
  def?: ImageDefinition;
  style?: React.CSSProperties;
  className?: string;
  width?: number | string;
  height?: number | string;
}

const ThemedImage: React.FC<ThemedImageProps> = ({ name, def: propDef, style, className, width, height }) => {
  const { images, colors, dimensions, processedImages } = useContext(ThemeContext);

  const def = useMemo(() => {
      if (propDef) return propDef;
      if (name) return images.get(name);
      return undefined;
  }, [name, propDef, images]);

  if (!def) return null;

  // Handle Alias
  if (def.type === 'alias' && def.ref) {
      const refDef = images.get(def.ref);
      if (!refDef) return null;

      return (
          <div
            className={className}
            style={{
                position: 'absolute',
                top: def.inset?.top,
                right: def.inset?.right,
                bottom: def.inset?.bottom,
                left: def.inset?.left,
                width: width || '100%',
                height: height || '100%',
                ...style
            }}
          >
              <ThemedImage
                def={{ ...refDef, tint: def.tint || refDef.tint }}
                width="100%"
                height="100%"
              />
          </div>
      );
  }

  // Handle Composed / Grid
  if (def.type === 'composed' || def.type === 'grid') {
      return (
          <div
            className={className}
            style={{
                position: 'relative',
                width: width || '100%',
                height: height || '100%',
                ...style
            }}
          >
              {def.children?.map((child, idx) => (
                  <ThemedImage
                    key={idx}
                    def={child}
                    style={{
                        position: 'absolute',
                        top: child.inset?.top || 0,
                        left: child.inset?.left || 0,
                        right: child.inset?.right !== undefined ? child.inset.right : undefined,
                        bottom: child.inset?.bottom !== undefined ? child.inset.bottom : undefined,
                        width: child.sizeOverwriteH ? parseInt(child.sizeOverwriteH) : undefined,
                        height: child.sizeOverwriteV ? parseInt(child.sizeOverwriteV) : undefined,
                    }}
                  />
              ))}
          </div>
      );
  }

  // Handle Area (Leaf node with image)
  if (def.type === 'area' || def.file) {
      const tint = resolveColor(def.tint, colors);

      const bgStyle: React.CSSProperties = {};
      let isBorderImage = false;

      // Try to find a processed (cropped) image
      const key = def.file && def.xywh ? `${def.file}:${def.xywh}` : undefined;
      const processedUrl = key ? processedImages.get(key) : undefined;

      if (def.file) {
          const dim = dimensions.get(def.file);
          const xywhParts = def.xywh && def.xywh !== '*' ? def.xywh.split(',').map(Number) : undefined;

          let useBorderImage = false;

          // Check for split (9-slice)
          if (def.splitx && def.splity) {
              const parseSplit = (str: string, prefix1: string, prefix2: string) => {
                  const p1 = str.match(new RegExp(`${prefix1}(\\d+)`));
                  const p2 = str.match(new RegExp(`${prefix2}(\\d+)`));
                  return [p1 ? parseInt(p1[1]) : 0, p2 ? parseInt(p2[1]) : 0];
              };
              const [l, r] = parseSplit(def.splitx, 'L', 'R');
              const [t, b] = parseSplit(def.splity, 'T', 'B');

              if (processedUrl) {
                  // Use processed image (already cropped to xywh)
                  bgStyle.borderImageSource = `url(${processedUrl})`;
                  // Since image is cropped, slice is just the split values
                  bgStyle.borderImageSlice = `${t} ${r} ${b} ${l} fill`;
                  bgStyle.borderWidth = `${t}px ${r}px ${b}px ${l}px`;
                  bgStyle.borderStyle = 'solid';
                  bgStyle.boxSizing = 'border-box';
                  useBorderImage = true;
              } else if (!processedUrl && !xywhParts) {
                  // Whole image 9-slice (if xywh='*') or no xywh
                  bgStyle.borderImageSource = `url(${def.file})`;
                  bgStyle.borderImageSlice = `${t} ${r} ${b} ${l} fill`;
                  bgStyle.borderWidth = `${t}px ${r}px ${b}px ${l}px`;
                  bgStyle.borderStyle = 'solid';
                  bgStyle.boxSizing = 'border-box';
                  useBorderImage = true;
              }
              // If xywhParts present but NOT processed (shouldn't happen if loaded correctly), fallback to simple bg
          }

          if (!useBorderImage) {
              if (processedUrl) {
                   // Use processed image as background, stretched to fill container
                   bgStyle.backgroundImage = `url(${processedUrl})`;
                   bgStyle.backgroundSize = '100% 100%';
                   bgStyle.backgroundRepeat = 'no-repeat';
                   // Fallback natural size if container doesn't set width/height
                   if (xywhParts) {
                       bgStyle.width = xywhParts[2];
                       bgStyle.height = xywhParts[3];
                   }
              } else if (xywhParts) {
                  // Just a region, treat as fill using atlas (can't stretch safely)
                  const [x, y, w, h] = xywhParts;
                  bgStyle.backgroundImage = `url(${def.file})`;
                  bgStyle.backgroundPosition = `-${x}px -${y}px`;
                  bgStyle.width = w;
                  bgStyle.height = h;
                  bgStyle.backgroundRepeat = 'no-repeat';
              } else {
                   // Whole image
                   bgStyle.backgroundImage = `url(${def.file})`;
                   bgStyle.backgroundSize = 'contain';
                   bgStyle.backgroundRepeat = 'no-repeat';
              }
          }
      }

      const content = (
          <div
            className={className}
            style={{
                position: 'relative',
                width: width || bgStyle.width,
                height: height || bgStyle.height,
                ...style
            }}
          >
              <div style={{ ...bgStyle, width: '100%', height: '100%' }} />

              {tint && (
                  <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: tint,
                        mixBlendMode: 'multiply',
                        pointerEvents: 'none'
                    }}
                  />
              )}
          </div>
      );

      return content;
  }

  // Select - Render first child
  if (def.type === 'select' && def.children?.[0]) {
      return <ThemedImage def={def.children[0]} style={style} className={className} width={width} height={height} />;
  }

  return null;
};

const BattlePreview: React.FC<BattlePreviewProps> = ({ state }) => {
  const [colors, setColors] = useState<Map<string, string>>(new Map());
  const [images, setImages] = useState<Map<string, ImageDefinition>>(new Map());
  const [dimensions, setDimensions] = useState<Map<string, { w: number; h: number }>>(new Map());
  const [processedImages, setProcessedImages] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const loadedColors = await loadThemeColors(state.activeTheme.id, state.activeTheme);
        const { images: loadedImages, dimensions: loadedDimensions } = await loadBattleImages(state.activeShape);

        // Find all unique image definitions (recursive) to process crops
        const uniqueDefs = new Map<string, ImageDefinition>();
        const visit = (def: ImageDefinition) => {
            if (def.file && def.xywh) {
                const key = `${def.file}:${def.xywh}`;
                if (!uniqueDefs.has(key)) {
                    uniqueDefs.set(key, def);
                }
            }
            def.children?.forEach(visit);
        };
        loadedImages.forEach(visit);

        const processed = new Map<string, string>();
        const processingPromises: Promise<void>[] = [];

        uniqueDefs.forEach((def, key) => {
             processingPromises.push((async () => {
                 return new Promise<void>((resolve) => {
                     const img = new Image();
                     img.crossOrigin = "Anonymous";
                     img.onload = () => {
                         const canvas = document.createElement('canvas');
                         const ctx = canvas.getContext('2d');
                         if (!ctx) return resolve();

                         let x = 0, y = 0, w = img.naturalWidth, h = img.naturalHeight;
                         if (def.xywh && def.xywh !== '*') {
                             const parts = def.xywh.split(',').map(Number);
                             if (parts.length === 4) {
                                 [x, y, w, h] = parts;
                             }
                         }

                         canvas.width = w;
                         canvas.height = h;
                         ctx.drawImage(img, x, y, w, h, 0, 0, w, h);

                         processed.set(key, canvas.toDataURL());
                         resolve();
                     };
                     img.onerror = () => {
                        console.error(`Failed to process image blob for ${key}`);
                        resolve();
                     };
                     img.src = def.file!;
                 });
             })());
        });

        await Promise.all(processingPromises);

        if (mounted) {
          setColors(loadedColors);
          setImages(loadedImages);
          setDimensions(loadedDimensions);
          setProcessedImages(processed);
          setLoading(false);
        }
      } catch (e) {
        console.error("Failed to load theme assets", e);
      }
    };
    load();
    return () => { mounted = false; };
  }, [state.activeTheme, state.activeShape]);

  const contextValue = useMemo(() => ({ colors, images, dimensions, processedImages }), [colors, images, dimensions, processedImages]);

  if (loading) {
    return <div className="flex items-center justify-center h-full text-white/50">Loading theme assets...</div>;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      <div className="relative w-full h-full bg-[#1c2328] overflow-hidden select-none">

        <div className="absolute inset-0 z-0">
             <ThemedImage name="battle-area" width="100%" height="100%" />
        </div>

        <div className="absolute inset-0 z-10 flex flex-col justify-between p-4">

            {/* Top Area: HP Bars */}
            <div className="flex justify-between items-start w-full px-8 pt-8">
                {/* Enemy HUD */}
                <div className="relative w-64 h-20">
                     <ThemedImage name="battle-ui-enemy" style={{ position: 'absolute', top: 0, left: 0 }} />
                     <div className="absolute top-2 left-4 text-white text-shadow-sm font-bold text-sm">Wild PIDGEY</div>
                     <div className="absolute top-8 left-16 w-32 h-3">
                        {/* Render background then progress */}
                        <div className="relative w-full h-full">
                            <ThemedImage name="health-progressbar.background" width="100%" height="100%" />
                            <ThemedImage name="health-progressbar-green.progressImage" width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }} />
                        </div>
                     </div>
                </div>

                {/* Player HUD */}
                <div className="relative w-64 h-24 mt-8">
                     <ThemedImage name="battle-ui-self" style={{ position: 'absolute', top: 0, right: 0 }} />
                     <div className="absolute top-4 right-12 text-white text-shadow-sm font-bold text-sm">CHARIZARD</div>
                     <div className="absolute top-10 right-12 w-32 h-3">
                        <div className="relative w-full h-full">
                            <ThemedImage name="health-progressbar.background" width="100%" height="100%" />
                            <ThemedImage name="health-progressbar-green.progressImage" width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }} />
                        </div>
                     </div>
                     <div className="absolute top-14 right-12 w-40 h-2">
                        <div className="relative w-full h-full">
                            <ThemedImage name="xp-progressbar.background" width="100%" height="100%" />
                            <ThemedImage name="xp-progressbar.progressImage" width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }} />
                        </div>
                     </div>
                </div>
            </div>

            {/* Bottom Area: Controls */}
            <div className="relative w-full h-1/3 min-h-[150px]">
                 <div className="absolute bottom-0 right-0 w-full h-full flex items-end">

                    {/* Message Box */}
                    <div className="flex-1 h-32 mr-2 relative">
                         <ThemedImage name="window-main-background" width="100%" height="100%" />
                         <div className="absolute inset-0 p-6 text-white text-lg leading-relaxed drop-shadow-md">
                             What will <span style={{ color: colors.get('main-color') }}>CHARIZARD</span> do?
                         </div>
                    </div>

                    {/* Action Buttons Area */}
                    <div className="w-[300px] h-32 relative grid grid-cols-2 gap-1 p-1">
                        <div className="col-span-1 row-span-1 relative group">
                             <ThemedImage name="button.default" width="100%" height="100%" />
                             <ThemedImage name="Battle-Fight-Icon" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }} />
                             <span className="absolute inset-0 flex items-center justify-center text-white font-bold drop-shadow-md z-10 pt-8">FIGHT</span>
                        </div>
                        <div className="col-span-1 row-span-1 relative">
                             <ThemedImage name="button.default" width="100%" height="100%" />
                             <ThemedImage name="Battle-Bag-Icon" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }} />
                             <span className="absolute inset-0 flex items-center justify-center text-white font-bold drop-shadow-md z-10 pt-8">BAG</span>
                        </div>
                        <div className="col-span-1 row-span-1 relative">
                             <ThemedImage name="button.default" width="100%" height="100%" />
                             <ThemedImage name="Battle-Switch-Icon" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }} />
                             <span className="absolute inset-0 flex items-center justify-center text-white font-bold drop-shadow-md z-10 pt-8">POKEMON</span>
                        </div>
                        <div className="col-span-1 row-span-1 relative">
                             <ThemedImage name="button.default" width="100%" height="100%" />
                             <ThemedImage name="Battle-Run-Icon" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }} />
                             <span className="absolute inset-0 flex items-center justify-center text-white font-bold drop-shadow-md z-10 pt-8">RUN</span>
                        </div>
                    </div>
                 </div>
            </div>
        </div>

      </div>
    </ThemeContext.Provider>
  );
};

export default BattlePreview;
