import React from 'react';
import { AppState, ColorTheme, IconPackId } from '../types';
import { COLOR_THEMES, ICON_PACKS } from '../constants';

interface MobileAppProps {
  state: AppState;
  onThemeChange: (theme: ColorTheme) => void;
  onIconPackChange: (id: IconPackId) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const MobileApp: React.FC<MobileAppProps> = ({ state, onThemeChange, onIconPackChange, onGenerate, isGenerating }) => {
  return (
    <div
      className="flex flex-col h-screen overflow-hidden transition-colors duration-500"
      style={{
        backgroundColor: state.activeTheme.sub,
        color: state.activeTheme.textOnSub
      }}
    >
      <header className="p-6 text-center border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-xl font-bold mb-2">Archetype Studio</h1>
        <p className="text-xs bg-white/10 p-2 rounded border border-white/5 inline-block">
          The full experience is available on desktop.
        </p>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-32">
        <h2 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">palette</span>
          Select Color Scheme
        </h2>

        <div className="space-y-3">
          {COLOR_THEMES.map((theme) => {
            const isActive = state.activeTheme.id === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => onThemeChange(theme)}
                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all border text-left ${
                  isActive
                    ? 'border-primary shadow-lg'
                    : 'border-white/5 hover:border-white/10 bg-white/5'
                }`}
                style={{
                    backgroundColor: isActive ? `${theme.hex}25` : undefined,
                    borderColor: isActive ? theme.hex : undefined
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-full shadow-lg border border-white/20 shrink-0"
                    style={{
                      backgroundColor: theme.hex,
                      boxShadow: isActive ? `0 0 15px ${theme.glow}` : 'none'
                    }}
                  />
                  <div>
                    <div className="font-bold text-base">{theme.name}</div>
                    {theme.description && (
                      <div className="text-xs opacity-60 mt-0.5">{theme.description}</div>
                    )}
                  </div>
                </div>
                {isActive && (
                  <span className="material-symbols-outlined text-xl" style={{ color: theme.hex }}>check_circle</span>
                )}
              </button>
            );
          })}
        </div>

        <h2 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-4 mt-8 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">grid_view</span>
          Icon Pack
        </h2>

        <div className="space-y-3">
          {ICON_PACKS.map((pack) => {
            const isActive = state.activeIconPack === pack.id;
            return (
              <button
                key={pack.id}
                onClick={() => onIconPackChange(pack.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all border text-left ${
                  isActive
                    ? 'border-primary shadow-lg'
                    : 'border-white/5 hover:border-white/10 bg-white/5'
                }`}
                style={{
                  backgroundColor: isActive ? `${state.activeTheme.hex}25` : undefined,
                  borderColor: isActive ? state.activeTheme.hex : undefined
                }}
              >
                <div>
                  <div className="font-bold text-base">{pack.name}</div>
                  {pack.description && (
                    <div className="text-xs opacity-60 mt-0.5">{pack.description}</div>
                  )}
                </div>
                {isActive && (
                  <span className="material-symbols-outlined text-xl" style={{ color: state.activeTheme.hex }}>check_circle</span>
                )}
              </button>
            );
          })}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-20">
        <button
          disabled={isGenerating}
          onClick={onGenerate}
          className={`w-full font-black tracking-tight h-14 rounded-xl flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-2xl relative overflow-hidden ${isGenerating ? 'opacity-80' : ''}`}
          style={{
            backgroundColor: state.activeTheme.hex,
            color: state.activeTheme.textOnMain,
            boxShadow: isGenerating ? 'none' : `0 0 30px ${state.activeTheme.glow}`
          }}
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin"></div>
              Compiling...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined font-black">download</span>
              Download Theme
            </>
          )}
        </button>
      </footer>
    </div>
  );
};

export default MobileApp;
