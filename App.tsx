
import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { Analytics } from "@vercel/analytics/react";
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Preview from './components/Preview';
import Footer from './components/Footer';
import MobileApp from './components/MobileApp';
import MaintenancePage from './components/MaintenancePage';
import { COLOR_THEMES, CURSOR_SETS, BUBBLE_SETS, COUNTER_STYLES, DEFAULT_CUSTOM_THEME } from './constants';
import { AppState, ColorTheme, ThemeShape, CounterStyle, LoginVariant, IconPackId } from './types';
import {
  getColorsFilename,
  getShapeInclude,
  getLoginInclude,
  getCursorInclude,
  getBubbleInclude,
  getCounterInclude,
  fetchBaseTheme,
  fetchLatestArchetypeInfo,
  fetchIconPackAtlas,
  getIconPackAtlasPath
} from './utils/exportUtils';
import { getRelativeTime } from './utils/dateUtils';
import archetypeConfig from './archetype-config.json';

const REPO_URL = 'https://github.com/ssjshields/archetype';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Game' | 'Login'>('Game');
  const [customTheme, setCustomTheme] = useState<ColorTheme>(DEFAULT_CUSTOM_THEME);
  const [state, setState] = useState<AppState>({
    activeTheme: COLOR_THEMES[0],
    activeShape: 'Round',
    activeCursorSet: CURSOR_SETS[0].id,
    activeBubbleSet: BUBBLE_SETS[0].id,
    activeCounterStyle: COUNTER_STYLES[0],
    activeLoginVariant: 'Unova',
    activeIconPack: 'rounded',
    archetypeInfo: {
      branch: 'snapshot',
      commit: archetypeConfig.archetypeRepo.commit,
      time: getRelativeTime(archetypeConfig.archetypeRepo.commitDate),
      repoUrl: REPO_URL,
      loading: true,
      error: false
    }
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

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

  useEffect(() => {
    let isCancelled = false;

    const loadLatestArchetypeInfo = async () => {
      try {
        const latestInfo = await fetchLatestArchetypeInfo(REPO_URL);

        if (isCancelled) {
          return;
        }

        setState(prev => ({
          ...prev,
          archetypeInfo: {
            ...prev.archetypeInfo!,
            branch: latestInfo.branch,
            commit: latestInfo.commit,
            time: getRelativeTime(latestInfo.commitDate),
            repoUrl: REPO_URL,
            loading: false,
            error: false
          }
        }));
      } catch (error) {
        console.error('Unable to fetch latest archetype metadata', error);

        if (isCancelled) {
          return;
        }

        setState(prev => ({
          ...prev,
          archetypeInfo: {
            ...prev.archetypeInfo!,
            loading: false,
            error: true
          }
        }));
      }
    };

    loadLatestArchetypeInfo();

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleThemeChange = (theme: ColorTheme) => setState(prev => ({ ...prev, activeTheme: theme }));
  const handleShapeChange = (shape: ThemeShape) => setState(prev => ({ ...prev, activeShape: shape }));
  const handleCursorSetChange = (id: string) => setState(prev => ({ ...prev, activeCursorSet: id }));
  const handleBubbleSetChange = (id: string) => setState(prev => ({ ...prev, activeBubbleSet: id }));
  const handleCounterStyleChange = (style: CounterStyle) => setState(prev => ({ ...prev, activeCounterStyle: style }));
  const handleLoginVariantChange = (variant: LoginVariant) => setState(prev => ({ ...prev, activeLoginVariant: variant }));
  const handleIconPackChange = (id: IconPackId) => setState(prev => ({ ...prev, activeIconPack: id }));

  const handleCustomThemeChange = (theme: ColorTheme) => {
    setCustomTheme(theme);
    if (state.activeTheme.id === 'custom') {
      setState(prev => ({ ...prev, activeTheme: theme }));
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const zip = await fetchBaseTheme({
        repoUrl: REPO_URL,
        branch: state.archetypeInfo?.branch,
        commitHash: state.archetypeInfo?.commit
      });

      const colorsFilename = getColorsFilename(state.activeTheme.id);

      if (state.activeTheme.id !== 'custom') {
        try {
          const response = await fetch(`/themes/colors/${colorsFilename}`);
          if (response.ok) {
            const xmlContent = await response.text();
            zip.file(`archetype/theme/${colorsFilename}`, xmlContent);
          }
        } catch (e) {
          console.error('Failed to load selected colors XML', e);
        }
      }

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

      const loginInclude = getLoginInclude(state.activeLoginVariant);
      const cursorInclude = getCursorInclude(state.activeCursorSet);
      const shapeInclude = getShapeInclude(state.activeShape);
      const bubbleInclude = getBubbleInclude(state.activeBubbleSet);
      const counterInclude = getCounterInclude(state.activeCounterStyle);

      const themeXml = await zip.file('archetype/theme/theme.xml')?.async('string');
      if (!themeXml) throw new Error('archetype/theme/theme.xml not found');

      const modifiedThemeXml = themeXml.replace(
        /<include filename="CHOOSE_YOUR_COLORS\.xml"\/>/,
        `<include filename="${colorsFilename}"/>`
      );
      zip.file('archetype/theme/theme.xml', modifiedThemeXml);

      const lookXml = await zip.file('archetype/theme/CHOOSE_YOUR_LOOK.xml')?.async('string');
      if (!lookXml) throw new Error('archetype/theme/CHOOSE_YOUR_LOOK.xml not found');

      const modifiedLookXml = lookXml
        .replace(
          /<include filename="backgrounds\/[^"]*"\/>/,
          `<include filename="backgrounds/${loginInclude}.xml"/>`
        )
        .replace(
          /<include filename="cursors\/[^"]*"\/>/,
          `<include filename="cursors/${cursorInclude}.xml"/>`
        )
        .replace(
          /<include filename="shapes\/[^"]*"\/>/,
          `<include filename="shapes/${shapeInclude}.xml"/>`
        )
        .replace(
          /<include filename="speech-bubbles\/[^"]*"\/>/,
          `<include filename="speech-bubbles/${bubbleInclude}.xml"/>`
        );
      zip.file('archetype/theme/CHOOSE_YOUR_LOOK.xml', modifiedLookXml);

      const counterXml = await zip.file('archetype/theme/CHOOSE_YOUR_COUNTER.xml')?.async('string');
      if (!counterXml) throw new Error('archetype/theme/CHOOSE_YOUR_COUNTER.xml not found');

      const modifiedCounterXml = counterXml.replace(
        /<include filename="counters\/[^"]*"\/>/,
        `<include filename="counters/${counterInclude}.xml"/>`
      );
      zip.file('archetype/theme/CHOOSE_YOUR_COUNTER.xml', modifiedCounterXml);

      const atlasData = await fetchIconPackAtlas(state.activeIconPack, zip);

      if (atlasData) {
        const atlasPath = getIconPackAtlasPath();
        zip.file(`archetype/${atlasPath}`, atlasData);
      }

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

  if (isMaintenanceMode) {
    return <MaintenancePage />;
  }

  if (isMobile) {
    return (
      <MobileApp
        state={state}
        onThemeChange={handleThemeChange}
        onIconPackChange={handleIconPackChange}
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
          onIconPackChange={handleIconPackChange}
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
