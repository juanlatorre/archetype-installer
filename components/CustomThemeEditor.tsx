import React from 'react';
import { ColorTheme } from '../types';

interface CustomThemeEditorProps {
  theme: ColorTheme;
  onChange: (theme: ColorTheme) => void;
}

const CustomThemeEditor: React.FC<CustomThemeEditorProps> = ({ theme, onChange }) => {
  const handleChange = (key: keyof ColorTheme, value: string) => {
    let newTheme = { ...theme, [key]: value };

    if (key === 'hex') {
       // Update glow based on the new hex value
       const hex = value;
       // Ensure hex is valid 6 char (+ #)
       if (/^#[0-9A-F]{6}$/i.test(hex)) {
         const r = parseInt(hex.slice(1, 3), 16);
         const g = parseInt(hex.slice(3, 5), 16);
         const b = parseInt(hex.slice(5, 7), 16);
         newTheme.glow = `rgba(${r}, ${g}, ${b}, 0.4)`;
       }
    }

    onChange(newTheme);
  };

  const fields: { key: keyof ColorTheme; label: string }[] = [
    { key: 'hex', label: 'Main Accent' },
    { key: 'sub', label: 'Background' },
    { key: 'textOnMain', label: 'Text on Accent' },
    { key: 'textOnSub', label: 'Text on Background' },
    { key: 'hpHigh', label: 'HP Color' },
    { key: 'xp', label: 'XP Color' },
    { key: 'friendship', label: 'Friendship Color' },
  ];

  return (
    <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
      <div className="mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: theme.textOnSub }}>
          <span className="material-symbols-outlined text-primary text-xl">tune</span>
          Custom Theme
        </h3>
        <p className="text-xs opacity-70" style={{ color: theme.textOnSub }}>Create your unique color scheme</p>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
        {fields.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
             <div className="flex flex-col">
               <span className="text-xs font-bold" style={{ color: theme.textOnSub }}>{label}</span>
               <span className="text-[10px] opacity-50 uppercase font-mono" style={{ color: theme.textOnSub }}>{theme[key] as string}</span>
             </div>
             <div className="relative size-8 rounded-full overflow-hidden border border-white/20 shadow-lg shrink-0">
               <input
                 type="color"
                 value={theme[key] as string}
                 onChange={(e) => handleChange(key, e.target.value)}
                 className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 cursor-pointer border-0"
               />
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomThemeEditor;
