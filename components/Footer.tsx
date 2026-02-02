
import React from 'react';
import { AppState } from '../types';

interface FooterProps {
  state: AppState;
  onGenerate: () => void;
  isGenerating: boolean;
}

const Footer: React.FC<FooterProps> = ({ state, onGenerate, isGenerating }) => {
  return (
    <footer className="glass border-t border-white/5 px-10 py-4 shrink-0 z-20">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest opacity-60" style={{ color: 'var(--text-on-sub)' }}>Selected Color</span>
            <div className="font-bold flex items-center gap-2" style={{ color: 'var(--text-on-sub)' }}>
              {state.activeTheme.name} 
              <span 
                className="size-2 rounded-full transition-all duration-300" 
                style={{ backgroundColor: state.activeTheme.hex, boxShadow: `0 0 12px ${state.activeTheme.hex}` }}
              />
            </div>
          </div>
          
          <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
          
          <div className="flex items-center gap-10">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest opacity-60" style={{ color: 'var(--text-on-sub)' }}>UI Shape</span>
              <span className="font-medium" style={{ color: 'var(--text-on-sub)' }}>{state.activeShape}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest opacity-60" style={{ color: 'var(--text-on-sub)' }}>Counter Style</span>
              <span className="font-medium" style={{ color: 'var(--text-on-sub)' }}>{state.activeCounterStyle}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest opacity-60" style={{ color: 'var(--text-on-sub)' }}>Login BG</span>
              <span className="font-medium" style={{ color: 'var(--text-on-sub)' }}>{state.activeLoginVariant}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 ml-auto">
          <button 
            disabled={isGenerating}
            onClick={onGenerate}
            className={`font-black tracking-tight px-8 h-12 rounded-xl flex items-center gap-3 transition-all transform active:scale-95 shadow-2xl relative overflow-hidden ${isGenerating ? 'opacity-80' : ''}`}
            style={{ 
              backgroundColor: state.activeTheme.hex,
              color: 'var(--text-on-main)',
              boxShadow: isGenerating ? 'none' : `0 0 30px ${state.activeTheme.glow}` 
            }}
          >
            {isGenerating ? (
              <>
                <div className="size-5 border-2 border-current/30 border-t-current rounded-full animate-spin"></div>
                Compiling...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined font-black">download</span>
                Build & Export
              </>
            )}
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
