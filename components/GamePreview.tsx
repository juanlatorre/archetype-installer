import React, { useEffect, useState, useMemo } from 'react';
import { AppState } from '../types';
import { loadThemeColors, loadBattleImages, ImageDefinition } from '../utils/themeParser';
import { ThemeContext } from './ThemeContext';
import ThemedImage from './ThemedImage';

interface GamePreviewProps {
  state: AppState;
}

const GamePreview: React.FC<GamePreviewProps> = ({ state }) => {
  const [colors, setColors] = useState<Map<string, string>>(new Map());
  const [images, setImages] = useState<Map<string, ImageDefinition>>(new Map());
  const [dimensions, setDimensions] = useState<Map<string, { w: number; h: number }>>(new Map());
  const [processedImages, setProcessedImages] = useState<Map<string, string>>(new Map());
  const [colorsLoading, setColorsLoading] = useState(true);
  const [imagesLoading, setImagesLoading] = useState(true);

  // Load Colors
  useEffect(() => {
    let mounted = true;
    const load = async () => {
        setColorsLoading(true);
        try {
            const loadedColors = await loadThemeColors(state.activeTheme.id, state.activeTheme);
            if (mounted) {
                setColors(loadedColors);
                setColorsLoading(false);
            }
        } catch (e) {
            console.error("Failed to load theme colors", e);
            if (mounted) setColorsLoading(false);
        }
    };
    load();
    return () => { mounted = false; };
  }, [state.activeTheme]);

  // Load Images
  useEffect(() => {
      let mounted = true;
      const load = async () => {
          setImagesLoading(true);
          try {
              const { images: loadedImages, dimensions: loadedDimensions } = await loadBattleImages(state.activeShape);
              if (mounted) {
                  setImages(loadedImages);
                  setDimensions(loadedDimensions);
              }
          } catch (e) {
              console.error("Failed to load game images", e);
              if (mounted) setImagesLoading(false);
          }
      };
      load();
      return () => { mounted = false; };
  }, [state.activeShape]);

  // Process Images (Canvas generation for 9-slice / splits)
  useEffect(() => {
      let mounted = true;
      if (images.size === 0) {
          if (mounted) setImagesLoading(false);
          return;
      }

      const process = async () => {
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
          images.forEach(visit);

          const processed = new Map<string, string>();
          const processingPromises: Promise<void>[] = [];

          uniqueDefs.forEach((def, key) => {
              processingPromises.push((async () => {
                  return new Promise<void>((resolve) => {
                      const img = new Image();
                      img.crossOrigin = "Anonymous";
                      img.onload = () => {
                          try {
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

                              if (w > 0 && h > 0) {
                                  canvas.width = w;
                                  canvas.height = h;
                                  ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
                                  processed.set(key, canvas.toDataURL());
                              }
                          } catch (err) {
                              console.error(`Error processing image canvas for ${key}`, err);
                          }
                          resolve();
                      };
                      img.onerror = () => resolve();
                      img.src = def.file!;
                  });
              })());
          });

          await Promise.all(processingPromises);

          if (mounted) {
              setProcessedImages(processed);
              setImagesLoading(false);
          }
      };

      process();
      return () => { mounted = false; };
  }, [images]);

  const contextValue = useMemo(() => ({ colors, images, dimensions, processedImages }), [colors, images, dimensions, processedImages]);

  if (imagesLoading && images.size === 0) {
    return <div className="flex items-center justify-center h-full text-white/50">Loading theme assets...</div>;
  }

  const fontMainColor = colors.get('font-main-color') || '#000000';
  const fontSubColor = colors.get('font-sub-color') || '#ffffff';

  return (
    <ThemeContext.Provider value={contextValue}>
      <div className="relative w-full h-full bg-[#303841] overflow-hidden select-none font-sans text-xs">

        {/* Placeholder Game Background */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-emerald-800 to-teal-900 opacity-50" />

        {/* --- Top Left Info --- */}
        <div className="absolute top-2 left-2 z-10 drop-shadow-md text-sm font-medium leading-tight" style={{ color: '#ffffff', textShadow: '1px 1px 0 #000' }}>
            <div>Mossdeep City Ch. 1</div>
            <div className="text-yellow-300">$ 1,203,405</div>
            <div>12:30</div>
        </div>

        {/* --- Global Trade Link (Center Window) --- */}
        {/* GTL-Window is defined in XML as composed with background + icon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] z-30">
            <ThemedImage name="GTL-Window" width="100%" height="100%" />
            {/* Mock Content for GTL to make it look active */}
            <div className="absolute inset-0 pt-8 px-4 pb-4 flex flex-col pointer-events-none">
                <div className="text-center font-bold mb-4 text-lg" style={{ color: fontMainColor }}>Global Trade Link</div>
                {/* Search Bar Area Mock */}
                <div className="flex gap-2 mb-4 h-8">
                     <div className="flex-1 relative">
                        <ThemedImage name="editfield.background" width="100%" height="100%" />
                     </div>
                     <div className="w-20 relative">
                        <ThemedImage name="ui-button.default" width="100%" height="100%" />
                        <span className="absolute inset-0 flex items-center justify-center" style={{ color: fontMainColor }}>Search</span>
                     </div>
                </div>
                 {/* Mock List */}
                <div className="flex-1 flex flex-col gap-[1px] opacity-80">
                     {[1, 2, 3, 4, 5, 6].map(i => (
                         <div key={i} className="h-10 w-full relative">
                             <ThemedImage name="ui-table-row.background" width="100%" height="100%" />
                             <div className="absolute inset-0 flex items-center px-4 justify-between" style={{ color: fontMainColor }}>
                                 <span className="font-bold">Pokemon {i}</span>
                                 <span>$ {i * 1000}</span>
                             </div>
                         </div>
                     ))}
                </div>
            </div>
        </div>

        {/* --- Pokemon Summary (Right - Floating) --- */}
        {/* Poke-Summary-Window is a grid, so it should render its background parts */}
        <div className="absolute top-20 right-20 w-[300px] h-[450px] z-20">
             <ThemedImage name="Poke-Summary-Window" width="100%" height="100%" />
             {/* Content Overlay */}
             <div className="absolute top-12 left-6 right-6 bottom-6 flex flex-col gap-2 pointer-events-none">
                 <div className="flex items-center gap-4">
                     <div className="w-16 h-16 bg-black/20 rounded-full border-2 border-white/20"></div>
                     <div>
                         <div className="text-lg font-bold" style={{ color: fontMainColor }}>Charizard</div>
                         <div style={{ color: fontSubColor }}>Lvl. 100</div>
                     </div>
                 </div>
                 <div className="mt-4 space-y-2">
                      <div className="h-4 w-full bg-red-500/50 rounded-full overflow-hidden">
                          <ThemedImage name="mi-hpbar-green.progressImage" width="100%" height="100%" />
                      </div>
                      <div className="h-2 w-full bg-blue-500/50 rounded-full overflow-hidden">
                           <ThemedImage name="mi-xpbar.progressImage" width="80%" height="100%" />
                      </div>
                 </div>
             </div>
        </div>

        {/* --- Party Bar (Right Edge) --- */}
        {/* Party-Frame is the background bar */}
        <div className="absolute top-1/2 -translate-y-1/2 right-0 w-16 h-[350px] z-20 flex flex-col justify-center gap-1 p-1">
             <div className="absolute inset-0 z-0">
                <ThemedImage name="Party-Frame" width="100%" height="100%" />
             </div>
             {/* Mock Party Slots */}
             {Array.from({ length: 6 }).map((_, i) => (
                 <div key={i} className="relative z-10 w-full aspect-square bg-black/10 rounded-full border border-white/10 flex items-center justify-center">
                     <div className="w-3/4 h-3/4 bg-white/20 rounded-full"></div>
                 </div>
             ))}
        </div>

        {/* --- Chat (Bottom Left) --- */}
        <div className="absolute bottom-0 left-0 w-[400px] h-[200px] z-20 flex flex-col">
             {/* Tabs */}
             <div className="h-7 flex gap-0 pl-1 items-end">
                 <div className="w-20 h-full relative">
                     <ThemedImage name="chat-tab.background" width="100%" height="100%" />
                     <span className="absolute inset-0 flex items-center justify-center font-bold" style={{ color: fontMainColor }}>General</span>
                 </div>
                 <div className="w-20 h-6 relative opacity-80">
                     <ThemedImage name="chat-tab.background" width="100%" height="100%" />
                     <span className="absolute inset-0 flex items-center justify-center text-xs" style={{ color: fontSubColor }}>Trade</span>
                 </div>
             </div>
             {/* Chat Body */}
             <div className="flex-1 relative">
                 <ThemedImage name="chatframe.background" width="100%" height="100%" />
                 <div className="absolute inset-0 p-3 flex flex-col justify-end gap-1 text-[11px] drop-shadow-sm font-medium" style={{ color: '#ffffff', textShadow: '1px 1px 0 #000' }}>
                     <div><span className="text-yellow-400 font-bold">[Global] Ash:</span> Anyone for PvP?</div>
                     <div><span className="text-green-400 font-bold">[Trade] Misty:</span> WTS Starmie 5x31</div>
                     <div><span className="text-blue-400 font-bold">[Team] Brock:</span> Gym looks tough today.</div>
                     <div><span className="text-white font-bold">[System]:</span> Welcome to PokeMMO!</div>
                 </div>
             </div>
        </div>

        {/* --- Menu Bar (Bottom Right) --- */}
        {/* Small-HUD-Overlay contains the grid of icons */}
        <div className="absolute bottom-0 right-0 z-40">
            {/*
               The XML defines Small-HUD-Overlay as a composed image containing grids of buttons.
               However, it relies on specific sizes. We might need to give it a container size.
               In MAsXAmMZ9W.xml, Small-HUD-Overlay uses 'Small-HUD-Button' which is 29x29.
               There are 10 icons in the row. So approx 290px wide + padding.
               Let's set a reasonable width/height and let Flexbox grid handle it.
            */}
            <div style={{ width: '380px', height: '50px' }}>
                <ThemedImage name="Small-HUD-Overlay" width="100%" height="100%" />
            </div>
        </div>

      </div>
    </ThemeContext.Provider>
  );
};

export default GamePreview;
