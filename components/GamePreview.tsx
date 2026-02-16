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
              // We use loadBattleImages but it loads the main UI assets too
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

  // Process Images (Canvas generation)
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

  const mainColor = colors.get('main-color') || '#ffffff';
  const subColor = colors.get('sub-color') || '#000000';
  const fontMainColor = colors.get('font-main-color') || '#000000';
  const fontSubColor = colors.get('font-sub-color') || '#ffffff';

  return (
    <ThemeContext.Provider value={contextValue}>
      <div className="relative w-full h-full bg-[#303841] overflow-hidden select-none font-sans text-xs">

        {/* Placeholder Game Background */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-emerald-800 to-teal-900 opacity-50" />

        {/* --- Top Left Info --- */}
        <div className="absolute top-2 left-2 z-10 text-white drop-shadow-md">
            <div>Mossdeep City Ch. 1</div>
            <div>$ 1,203,405</div>
            <div>12:30</div>
        </div>

        {/* --- Global Trade Link (Top Left Window) --- */}
        <div className="absolute top-12 left-4 w-72 h-80 z-20">
            <ThemedImage name="GTL-Window" width="100%" height="100%" />
            <div className="absolute inset-0 pt-8 px-2 pb-2 flex flex-col">
                <div className="text-center font-bold mb-2" style={{ color: fontMainColor }}>Global Trade Link</div>
                {/* Mock Search Bar */}
                <div className="h-6 mb-2 relative">
                    <ThemedImage name="editfield.background" width="100%" height="100%" />
                </div>
                {/* Mock Table Header */}
                <div className="h-6 w-full relative mb-1">
                     <ThemedImage name="ui-table-header.background" width="100%" height="100%" />
                     <div className="absolute inset-0 flex items-center px-2 justify-between" style={{ color: fontSubColor }}>
                         <span>Pokemon</span>
                         <span>Price</span>
                     </div>
                </div>
                {/* Mock Rows */}
                <div className="flex-1 flex flex-col gap-[1px]">
                     {[1, 2, 3, 4, 5].map(i => (
                         <div key={i} className="h-8 w-full relative">
                             <ThemedImage name="ui-table-row.background" width="100%" height="100%" />
                             <div className="absolute inset-0 flex items-center px-2 justify-between" style={{ color: fontMainColor }}>
                                 <div className="flex items-center gap-1">
                                    <div className="w-6 h-6 bg-white/20 rounded-full"></div>
                                    <span>Pidgey</span>
                                 </div>
                                 <span>$ 500</span>
                             </div>
                         </div>
                     ))}
                </div>
            </div>
        </div>

        {/* --- Pokedex (Center Window) --- */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] z-30">
             <ThemedImage name="PokeDex-Window" width="100%" height="100%" />
             <div className="absolute inset-0 pt-8 px-3 pb-3 flex flex-col">
                  <div className="text-center font-bold mb-2" style={{ color: fontMainColor }}>Pokédex</div>
                  <div className="flex-1 grid grid-cols-6 gap-1 content-start overflow-hidden p-1">
                      {Array.from({ length: 24 }).map((_, i) => (
                          <div key={i} className="aspect-square relative group">
                              <ThemedImage name="ui-button.default" width="100%" height="100%" />
                              <div className="absolute inset-0 flex items-center justify-center text-xs opacity-50" style={{ color: fontMainColor }}>
                                  ?
                              </div>
                          </div>
                      ))}
                  </div>
             </div>
        </div>

        {/* --- Chat (Bottom Left) --- */}
        <div className="absolute bottom-4 left-4 w-80 h-48 z-20 flex flex-col">
             {/* Tabs */}
             <div className="h-6 flex gap-1 pl-1">
                 <div className="w-16 h-full relative">
                     <ThemedImage name="chat-tab.background" width="100%" height="100%" />
                     <span className="absolute inset-0 flex items-center justify-center" style={{ color: fontMainColor }}>All</span>
                 </div>
                 <div className="w-16 h-full relative opacity-70">
                     <ThemedImage name="chat-tab.background" width="100%" height="100%" />
                     <span className="absolute inset-0 flex items-center justify-center" style={{ color: fontMainColor }}>Battle</span>
                 </div>
             </div>
             {/* Chat Body */}
             <div className="flex-1 relative">
                 <ThemedImage name="chatframe.background" width="100%" height="100%" />
                 <div className="absolute inset-0 p-2 flex flex-col justify-end gap-1 text-[10px] drop-shadow-sm" style={{ color: '#ffffff' }}>
                     <div><span className="text-yellow-400">[Global] Player1:</span> Anyone for PvP?</div>
                     <div><span className="text-green-400">[Trade] Player2:</span> WTS Shiny Charizard</div>
                     <div><span className="text-blue-400">[Team] Player3:</span> Good luck!</div>
                 </div>
             </div>
        </div>

        {/* --- Menu Bar (Bottom Right) --- */}
        <div className="absolute bottom-0 right-0 w-auto h-12 z-40">
            {/* The Bag-HUD contains the icons composed inside it, so we just render it */}
             <ThemedImage name="Bag-HUD" width="100%" height="100%" />
             {/* Fallback dimensions if theme doesn't force width */}
             <div style={{ width: '400px', height: '50px' }}></div>
        </div>

        {/* --- Pokemon Summary (Right Edge - Partial) --- */}
        <div className="absolute top-20 right-4 w-64 h-96 z-10 opacity-90">
             <ThemedImage name="Poke-Summary-Window" width="100%" height="100%" />
             <div className="absolute top-10 left-4 w-20 h-20 bg-black/20 rounded-full border-2 border-white/10"></div>
             <div className="absolute top-10 left-28 font-bold text-lg" style={{ color: fontMainColor }}>Pikachu</div>
             <div className="absolute top-16 left-28 text-sm" style={{ color: fontSubColor }}>Lvl. 100</div>
        </div>

      </div>
    </ThemeContext.Provider>
  );
};

export default GamePreview;
