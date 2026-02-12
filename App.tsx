
import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { Analytics } from "@vercel/analytics/react";
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Preview from './components/Preview';
import Footer from './components/Footer';
import MobileApp from './components/MobileApp';
import { COLOR_THEMES, CURSOR_SETS, BUBBLE_SETS, COUNTER_STYLES, DEFAULT_CUSTOM_THEME } from './constants';
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
import { getRelativeTime } from './utils/dateUtils';
import archetypeInfoData from './archetype-info.json';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Game' | 'Login'>('Game');
  const [customTheme, setCustomTheme] = useState<ColorTheme>(DEFAULT_CUSTOM_THEME);
  const [state, setState] = useState<AppState>({
    activeTheme: COLOR_THEMES[0], // This is now DEFAULT_CUSTOM_THEME if it's the first in list, but let's rely on list order
    activeShape: 'Round',
    activeCursorSet: CURSOR_SETS[0].id,
    activeBubbleSet: BUBBLE_SETS[0].id,
    activeCounterStyle: COUNTER_STYLES[0],
    activeLoginVariant: 'Unova',
    archetypeInfo: {
      ...archetypeInfoData,
      time: getRelativeTime(archetypeInfoData.commitDate)
    }
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const handleCustomThemeChange = (theme: ColorTheme) => {
    setCustomTheme(theme);
    if (state.activeTheme.id === 'custom') {
      setState(prev => ({ ...prev, activeTheme: theme }));
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const zip = new JSZip();

      await copyFolderRecursively(zip, 'archetype', 'archetype');

      const colorsFilename = getColorsFilename(state.activeTheme.id);

      if (state.activeTheme.id === 'custom') {
        try {
          const response = await fetch('/themes/colors/CHOOSE_YOUR_COLORS.xml');
          if (response.ok) {
            let xmlContent = await response.text();

            xmlContent = xmlContent
              .replace(/(<constantDef name="main-color"><color>)[^<]*(<\/color><\/constantDef>)/g, `$1${state.activeTheme.hex}$2`)
              .replace(/(<constantDef name="sub-color"><color>)[^<]*(<\/color><\/constantDef>)/g, `$1${state.activeTheme.sub}$2`)
              .replace(/(<constantDef name="font-main-color"><color>)[^<]*(<\/color><\/constantDef>)/g, `$1${state.activeTheme.textOnMain}$2`)
              .replace(/(<constantDef name="font-sub-color"><color>)[^<]*(<\/color><\/constantDef>)/g, `$1${state.activeTheme.textOnSub}$2`)
              .replace(/(<constantDef name="hp-high-color"><color>)[^<]*(<\/color><\/constantDef>)/g, `$1${state.activeTheme.hpHigh}$2`)
              .replace(/(<constantDef name="xp-color"><color>)[^<]*(<\/color><\/constantDef>)/g, `$1${state.activeTheme.xp}$2`)
              .replace(/(<constantDef name="friendship-color"><color>)[^<]*(<\/color><\/constantDef>)/g, `$1${state.activeTheme.friendship}$2`);

            zip.file('archetype/theme/CHOOSE_YOUR_COLORS.xml', xmlContent);
          }
        } catch (e) {
          console.error("Failed to generate custom colors XML", e);
        }
      }

      const shapeInclude = getShapeInclude(state.activeShape);
      const shapeAtlas = getShapeAtlas(state.activeShape);
      const loginInclude = getLoginInclude(state.activeLoginVariant);
      const cursorInclude = getCursorInclude(state.activeCursorSet);
      const bubbleInclude = getBubbleInclude(state.activeBubbleSet);
      const counterInclude = getCounterInclude(state.activeCounterStyle);

      const infoXml = await (await fetch('/archetype/info.xml')).text();
      let modifiedInfoXml = infoXml.replace(
        /sprite_atlas="[^"]*"/,
        `sprite_atlas="${shapeAtlas}"`
      );

      if (state.activeTheme.id === 'custom') {
        modifiedInfoXml = modifiedInfoXml.replace(
          /name="Archetype"/,
          `name="${state.activeTheme.name}"`
        );
      }

      zip.file('archetype/info.xml', modifiedInfoXml);

      const themeXml = await (await fetch('/archetype/theme/theme.xml')).text();
      const modifiedThemeXml = themeXml.replace(
        /<include filename="CHOOSE_YOUR_COLORS\.xml"\/>/,
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

      let filename = `archetype-${state.activeTheme.id.toLowerCase()}.zip`;
      if (state.activeTheme.id === 'custom') {
        const sanitizedName = state.activeTheme.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        filename = `archetype-${sanitizedName || 'custom'}.zip`;
      }

      a.download = filename;
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

  if (isMobile) {
    return (
      <MobileApp
        state={state}
        onThemeChange={handleThemeChange}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
      />
    );
  }

  return (
    <div
      className="flex flex-col h-screen overflow-hidden transition-colors duration-500"
      style={{
        backgroundColor: state.activeTheme.sub,
        color: state.activeTheme.textOnSub
      }}
    >
      <Navbar state={state} archetypeInfo={state.archetypeInfo} />

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
          customTheme={customTheme}
          onCustomThemeChange={handleCustomThemeChange}
        />
        
        <Preview 
          state={state} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      </main>

      <Footer state={state} onGenerate={handleGenerate} isGenerating={isGenerating} />
      <Analytics />
    </div>
  );
};

export default App;
