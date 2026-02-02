
import React from 'react';
import { COLOR_THEMES, CURSOR_SETS, BUBBLE_SETS, COUNTER_STYLES, LOGIN_VARIANTS } from '../constants';
import { AppState, ColorTheme, ThemeShape, CounterStyle, LoginVariant } from '../types';

interface SidebarProps {
  state: AppState;
  activeTab: 'Game' | 'Login';
  onThemeChange: (theme: ColorTheme) => void;
  onShapeChange: (shape: ThemeShape) => void;
  onCursorChange: (id: string) => void;
  onBubbleChange: (id: string) => void;
  onCounterStyleChange: (style: CounterStyle) => void;
  onLoginVariantChange: (variant: LoginVariant) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  state,
  activeTab,
  onThemeChange, 
  onShapeChange, 
  onCursorChange, 
  onBubbleChange,
  onCounterStyleChange,
  onLoginVariantChange
}) => {
  if (activeTab === 'Login') {
    return (
      <aside className="w-[380px] flex flex-col glass border-r border-white/5 custom-scrollbar overflow-y-auto z-10 shrink-0">
        <div className="p-6 space-y-8 animate-in slide-in-from-left-4 duration-300">
          <section>
            <div className="mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: state.activeTheme.textOnSub }}>
                <span className="material-symbols-outlined text-primary text-xl">wallpaper</span>
                Login Variants
              </h3>
              <p className="text-xs opacity-70" style={{ color: state.activeTheme.textOnSub }}>Choose the visual core of your login screen</p>
            </div>
            
            <div className="space-y-3">
              {LOGIN_VARIANTS.map((variant) => {
                const isActive = state.activeLoginVariant === variant.id;
                return (
                  <button
                    key={variant.id}
                    onClick={() => onLoginVariantChange(variant.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all border shrink-0 ${
                      isActive 
                        ? 'border-primary shadow-[0_4px_20px_rgba(0,0,0,0.2)]' 
                        : 'border-white/5 hover:border-white/10'
                    }`}
                    style={{ 
                      backgroundColor: isActive ? `${state.activeTheme.hex}15` : 'rgba(255,255,255,0.03)' 
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm uppercase tracking-widest" style={{ color: state.activeTheme.textOnSub }}>
                        {variant.name}
                      </span>
                      {isActive && (
                        <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-[380px] flex flex-col glass border-r border-white/5 custom-scrollbar overflow-y-auto z-10 shrink-0">
      <div className="p-6 space-y-8 animate-in slide-in-from-left-4 duration-300">
        {/* Color Themes */}
        <section>
          <div className="mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: state.activeTheme.textOnSub }}>
              <span className="material-symbols-outlined text-primary text-xl">palette</span>
              Color Themes
            </h3>
            <p className="text-xs opacity-70" style={{ color: state.activeTheme.textOnSub }}>Primary accent and UI color</p>
          </div>
          
          <div className="grid grid-cols-1 gap-2 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
            {COLOR_THEMES.map((theme) => {
              const isActive = state.activeTheme.id === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => onThemeChange(theme)}
                  className={`relative flex items-center justify-between p-3.5 rounded-xl transition-all border shrink-0 ${
                    isActive 
                      ? 'border-primary shadow-[0_4px_12px_rgba(0,0,0,0.1)]' 
                      : 'border-white/5 hover:border-white/10'
                  }`}
                  style={{ 
                    backgroundColor: isActive ? `${theme.hex}25` : 'rgba(255,255,255,0.03)' 
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="size-7 rounded-full shadow-lg border border-white/20" 
                      style={{ 
                        backgroundColor: theme.hex,
                        boxShadow: isActive ? `0 0 15px ${theme.glow}` : 'none'
                      }}
                    />
                    <span className="font-bold text-sm" style={{ color: state.activeTheme.textOnSub }}>
                      {theme.name}
                    </span>
                  </div>
                  {isActive && (
                    <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Theme Shape */}
        <section>
          <div className="mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: state.activeTheme.textOnSub }}>
              <span className="material-symbols-outlined text-primary text-xl">layers</span>
              Theme Shape
            </h3>
          </div>
          <div className="flex p-1 rounded-lg border border-white/5" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
            {(['Round', 'Sharp'] as ThemeShape[]).map((shape) => {
              const isActive = state.activeShape === shape;
              return (
                <button
                  key={shape}
                  onClick={() => onShapeChange(shape)}
                  className="flex-1 py-2 text-sm font-bold transition-all rounded-md"
                  style={{ 
                    backgroundColor: isActive ? state.activeTheme.hex : 'transparent',
                    color: isActive ? state.activeTheme.textOnMain : state.activeTheme.textOnSub,
                    opacity: isActive ? 1 : 0.6,
                    boxShadow: isActive ? `0 0 10px ${state.activeTheme.glow}` : 'none'
                  }}
                >
                  {shape}
                </button>
              );
            })}
          </div>
        </section>

        {/* Counter Style */}
        <section>
          <div className="mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: state.activeTheme.textOnSub }}>
              <span className="material-symbols-outlined text-primary text-xl">analytics</span>
              Counter Style
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar p-1 rounded-lg border border-white/5" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
            {COUNTER_STYLES.map((style) => {
              const isActive = state.activeCounterStyle === style;
              const displayName = style.replace('Counter-', '').replace(/-/g, ' ');
              return (
                <button
                  key={style}
                  onClick={() => onCounterStyleChange(style)}
                  className="py-3 text-[10px] font-black uppercase tracking-tight transition-all rounded-md px-2 text-center leading-tight border shrink-0 min-h-[50px] flex items-center justify-center"
                  style={{ 
                    backgroundColor: isActive ? `${state.activeTheme.hex}25` : 'rgba(255,255,255,0.05)',
                    color: state.activeTheme.textOnSub,
                    borderColor: isActive ? state.activeTheme.hex : 'transparent',
                    opacity: isActive ? 1 : 0.7,
                  }}
                >
                  {displayName}
                </button>
              );
            })}
          </div>
        </section>

        {/* Interaction Styles */}
        <section className="space-y-6">
          {/* Cursors */}
          <div>
            <div className="mb-3">
              <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: state.activeTheme.textOnSub }}>
                <span className="material-symbols-outlined text-primary text-base">near_me</span>
                Cursor Style
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {CURSOR_SETS.map((set) => {
                const isActive = state.activeCursorSet === set.id;
                return (
                  <button
                    key={set.id}
                    onClick={() => onCursorChange(set.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition-all gap-1.5 ${
                      isActive ? 'border-primary shadow-[0_0_10px_var(--primary-glow)]' : 'border-white/5 hover:border-white/20'
                    }`}
                    style={{ 
                      backgroundColor: isActive ? `${state.activeTheme.hex}15` : 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <div className="relative size-12 flex items-center justify-center rounded checkered overflow-hidden border border-white/5">
                       <div 
                         style={{
                           width: `${set.sprite.w}px`,
                           height: `${set.sprite.h}px`,
                           backgroundImage: `url(${set.file})`,
                           backgroundPosition: `-${set.sprite.x}px -${set.sprite.y}px`,
                           backgroundRepeat: 'no-repeat',
                           imageRendering: 'pixelated',
                           transform: 'scale(1.5)',
                         }}
                       />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-center" style={{ color: state.activeTheme.textOnSub }}>
                      {set.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bubbles */}
          <div>
            <div className="mb-3">
              <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: state.activeTheme.textOnSub }}>
                <span className="material-symbols-outlined text-primary text-base">chat_bubble</span>
                Bubble Style
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {BUBBLE_SETS.map((set) => {
                const isActive = state.activeBubbleSet === set.id;
                return (
                  <button
                    key={set.id}
                    onClick={() => onBubbleChange(set.id)}
                    className={`flex items-center p-2 rounded-lg border transition-all gap-3 ${
                      isActive ? 'border-primary bg-primary/10' : 'border-white/5 hover:border-white/20'
                    }`}
                    style={{ 
                      backgroundColor: isActive ? `${state.activeTheme.hex}15` : 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: state.activeTheme.textOnSub }}>
                        {set.name}
                      </span>
                      <span className="text-[8px] opacity-40 uppercase tracking-widest" style={{ color: state.activeTheme.textOnSub }}>
                        Dialogue Skin
                      </span>
                    </div>
                    {isActive && (
                      <span className="material-symbols-outlined text-primary ml-auto text-sm">check_circle</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
};

export default Sidebar;