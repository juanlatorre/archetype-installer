
import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Preview from './components/Preview';
import Footer from './components/Footer';
import { COLOR_THEMES, CURSOR_SETS, BUBBLE_SETS, COUNTER_STYLES } from './constants';
import { AppState, ColorTheme, ThemeShape, CounterStyle, LoginVariant } from './types';
import {
  getColorsFilename,
  getShapeInclude,
  getShapeAtlas,
  getLoginInclude,
  getCursorInclude,
  getBubbleInclude,
  getCounterInclude,
  copyFolderRecursively
} from './utils/exportUtils';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Game' | 'Login'>('Game');
  const [state, setState] = useState<AppState>({
    activeTheme: COLOR_THEMES[0],
    activeShape: 'Round',
    activeCursorSet: CURSOR_SETS[0].id,
    activeBubbleSet: BUBBLE_SETS[0].id,
    activeCounterStyle: COUNTER_STYLES[0],
    activeLoginVariant: 'Unova'
  });

  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', state.activeTheme.hex);
    root.style.setProperty('--primary-glow', state.activeTheme.glow);
    root.style.setProperty('--sub-color', state.activeTheme.sub);
    root.style.setProperty('--text-on-main', state.activeTheme.textOnMain);
    root.style.setProperty('--text-on-sub', state.activeTheme.textOnSub);
    root.style.setProperty('--glass-bg', `${state.activeTheme.sub}F2`);
  }, [state.activeTheme]);

  const handleThemeChange = (theme: ColorTheme) => setState(prev => ({ ...prev, activeTheme: theme }));
  const handleShapeChange = (shape: ThemeShape) => setState(prev => ({ ...prev, activeShape: shape }));
  const handleCursorSetChange = (id: string) => setState(prev => ({ ...prev, activeCursorSet: id }));
  const handleBubbleSetChange = (id: string) => setState(prev => ({ ...prev, activeBubbleSet: id }));
  const handleCounterStyleChange = (style: CounterStyle) => setState(prev => ({ ...prev, activeCounterStyle: style }));
  const handleLoginVariantChange = (variant: LoginVariant) => setState(prev => ({ ...prev, activeLoginVariant: variant }));

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const zip = new JSZip();

      await copyFolderRecursively(zip, 'archetype', 'archetype');

      const colorsFilename = getColorsFilename(state.activeTheme.id);
      const shapeInclude = getShapeInclude(state.activeShape);
      const shapeAtlas = getShapeAtlas(state.activeShape);
      const loginInclude = getLoginInclude(state.activeLoginVariant);
      const cursorInclude = getCursorInclude(state.activeCursorSet);
      const bubbleInclude = getBubbleInclude(state.activeBubbleSet);
      const counterInclude = getCounterInclude(state.activeCounterStyle);

      const infoXml = await (await fetch('/archetype/info.xml')).text();
      const modifiedInfoXml = infoXml.replace(
        /sprite_atlas="[^"]*"/,
        `sprite_atlas="${shapeAtlas}"`
      );
      zip.file('archetype/info.xml', modifiedInfoXml);

      const themeXml = await (await fetch('/archetype/theme/theme.xml')).text();
      const modifiedThemeXml = themeXml.replace(
        /<include filename="CHOOSE_YOUR_COLORS.xml"\/>/,
        `<include filename="${colorsFilename}"/>`
      );
      zip.file('archetype/theme/theme.xml', modifiedThemeXml);

      const lookXml = await (await fetch('/archetype/theme/CHOOSE_YOUR_LOOK.xml')).text();
      const modifiedLookXml = lookXml
        .replace(
          /<include filename="assets\/Unova\.xml"\/>/,
          `<include filename="assets/${loginInclude}.xml"/>`
        )
        .replace(
          /<include filename="assets\/Cursors-Black\.xml"\/>/,
          `<include filename="assets/${cursorInclude}.xml"/>`
        )
        .replace(
          /<include filename="assets\/Round\.xml"\/>/,
          `<include filename="assets/${shapeInclude}.xml"/>`
        )
        .replace(
          /<include filename="assets\/Archetype\.xml"\/>/,
          `<include filename="assets/${bubbleInclude}.xml"/>`
        );
      zip.file('archetype/theme/CHOOSE_YOUR_LOOK.xml', modifiedLookXml);

      const counterXml = await (await fetch('/archetype/theme/CHOOSE_YOUR_COUNTER.xml')).text();
      const modifiedCounterXml = counterXml.replace(
        /<include filename="assets\/[^"]*"\/>/,
        `<include filename="assets/${counterInclude}.xml"/>`
      );
      zip.file('archetype/theme/CHOOSE_YOUR_COUNTER.xml', modifiedCounterXml);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `archetype-${state.activeTheme.id.toLowerCase()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error generating theme:', error);
      alert('Error generating theme. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div 
      className="flex flex-col h-screen overflow-hidden transition-colors duration-500" 
      style={{ 
        backgroundColor: state.activeTheme.sub,
        color: state.activeTheme.textOnSub
      }}
    >
      <Navbar state={state} />
      
      <main className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          state={state}
          activeTab={activeTab}
          onThemeChange={handleThemeChange}
          onShapeChange={handleShapeChange}
          onCursorChange={handleCursorSetChange}
          onBubbleChange={handleBubbleSetChange}
          onCounterStyleChange={handleCounterStyleChange}
          onLoginVariantChange={handleLoginVariantChange}
        />
        
        <Preview 
          state={state} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      </main>

      <Footer state={state} onGenerate={handleGenerate} isGenerating={isGenerating} />
    </div>
  );
};

export default App;
