import React from "react";
import { AppState } from "../types";
import BattlePreview from "./BattlePreview";

interface PreviewProps {
  state: AppState;
  activeTab: "Game" | "Login";
  onTabChange: (tab: "Game" | "Login") => void;
}

const Preview: React.FC<PreviewProps> = ({ state, activeTab, onTabChange }) => {
  const borderRadius = state.activeShape === "Round" ? "20px" : "2px";
  const loginBackgroundImage =
    state.activeLoginVariant === "Unova"
      ? "Unova.png"
      : state.activeLoginVariant === "Allstars"
      ? "Allstars.png"
      : "Default.png";

  return (
    <section className="flex-1 p-8 flex flex-col relative overflow-hidden">
      {/* Background Glow */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none transition-all duration-700"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, ${state.activeTheme.hex} 0%, transparent 80%)`,
        }}
      />

      {/* Tabbed Container */}
      <div
        className="relative flex-1 flex flex-col shadow-2xl border border-white/10 transition-all bg-black overflow-hidden"
        style={{ borderRadius }}
      >
        {/* Tab Headers */}
        <div
          className="h-14 shrink-0 border-b border-white/5 flex items-center px-4 gap-1 z-50 relative"
          style={{ backgroundColor: `${state.activeTheme.sub}FC` }}
        >
          {(["Game", "Login"] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className="h-full px-8 flex items-center text-[11px] font-black uppercase tracking-[0.3em] transition-all relative group"
                style={{
                  color: isActive
                    ? state.activeTheme.textOnSub
                    : `${state.activeTheme.textOnSub}44`,
                }}
              >
                {tab}
                {isActive && (
                  <div
                    className="absolute bottom-0 inset-x-0 h-1 shadow-[0_-4px_12px_var(--primary-glow)]"
                    style={{ backgroundColor: state.activeTheme.hex }}
                  />
                )}
                {!isActive && (
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-transparent group-hover:bg-white/5 transition-colors" />
                )}
              </button>
            );
          })}

          <div className="ml-auto flex items-center gap-2 opacity-20 pr-4">
            <div className="size-1.5 rounded-full bg-white"></div>
            <div className="size-1.5 rounded-full bg-white"></div>
            <div className="size-1.5 rounded-full bg-white"></div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative overflow-hidden bg-black">
          <div className="absolute inset-0 animate-in fade-in duration-700">
            {activeTab === "Game" ? (
              <BattlePreview state={state} />
            ) : (
              <div
                className="absolute inset-0 z-40 pointer-events-none p-6 flex flex-col justify-between"
                style={{
                  backgroundImage: `url(${loginBackgroundImage})`,
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Preview;
